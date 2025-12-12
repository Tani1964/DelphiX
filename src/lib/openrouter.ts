import { ChatMessage } from '@/types';

/**
 * Transcribe audio file to text using OpenAI Whisper API
 * Note: OpenRouter does not support the /audio/transcriptions endpoint,
 * so we must use OpenAI API directly. OPENAI_API_KEY is required.
 */
async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // Fetch the audio file from the server
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${baseUrl}${audioUrl}`;
    
    const audioResponse = await fetch(fullAudioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio file');
    }

    const audioBlob = await audioResponse.blob();
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    // OpenRouter doesn't support audio transcription endpoint (returns 405)
    // We must use OpenAI API directly for Whisper transcription
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY is required for audio transcription. OpenRouter does not support the /audio/transcriptions endpoint. Please add OPENAI_API_KEY to your environment variables.');
    }

    // Use OpenAI API directly for Whisper (OpenRouter doesn't support this endpoint)
    const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
    const headers = {
      Authorization: `Bearer ${openaiKey}`,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      // Read response body as text first (can only be read once)
      const errorText = await response.text();
      let errorDetails: string;
      
      // Try to parse as JSON for structured error info
      try {
        const errorData = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorData, null, 2);
      } catch {
        errorDetails = errorText || `HTTP ${response.status} ${response.statusText}`;
      }
      
      console.error('Transcription API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
        url: apiUrl,
      });
      throw new Error(`Transcription failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const transcribedText = data.text || data.transcript || '';
    
    if (!transcribedText) {
      console.warn('Transcription returned empty result:', data);
      throw new Error('Transcription returned empty result');
    }
    
    return transcribedText;
  } catch (error) {
    console.error('Audio transcription error:', error);
    throw error;
  }
}

export async function getDiagnosisFromAI(
  messages: ChatMessage[],
  attachments?: { type: 'image' | 'audio'; url: string }[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'amazon/nova-2-lite-v1:free';

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // Format messages for OpenRouter API
  // Note: We'll handle multimodal content (images) separately
  const formattedMessages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }> = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Handle image attachments first - encode and send as multimodal content
  // This must be done before audio to avoid type conflicts
  if (attachments?.some((a) => a.type === 'image')) {
    const imageAttachments = attachments.filter((a) => a.type === 'image');
    if (imageAttachments.length > 0 && formattedMessages.length > 0) {
      const lastMessage = formattedMessages[formattedMessages.length - 1];
      if (lastMessage.role === 'user') {
        // Fetch and encode images as base64
        const imageContents: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        
        // Add text content if it exists
        if (typeof lastMessage.content === 'string' && lastMessage.content.trim()) {
          imageContents.push({
            type: 'text',
            text: lastMessage.content,
          });
        } else if (typeof lastMessage.content === 'string') {
          imageContents.push({
            type: 'text',
            text: 'Please analyze this image for medical symptoms.',
          });
        }
        
        // Fetch and encode each image
        for (const imageAttachment of imageAttachments) {
          try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const fullImageUrl = imageAttachment.url.startsWith('http') 
              ? imageAttachment.url 
              : `${baseUrl}${imageAttachment.url}`;
            
            const imageResponse = await fetch(fullImageUrl);
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              const arrayBuffer = await imageBlob.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              
              // Determine MIME type
              const mimeType = imageBlob.type || 'image/jpeg';
              
              imageContents.push({
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              });
            }
          } catch (error) {
            console.error('Failed to encode image:', error);
            // Fallback to text note if image encoding fails
            if (imageContents.length === 0 || imageContents[imageContents.length - 1].type !== 'text') {
              imageContents.push({
                type: 'text',
                text: '[User has attached an image for analysis]',
              });
            }
          }
        }
        
        // Update the message with multimodal content
        if (imageContents.length > 0) {
          lastMessage.content = imageContents;
        }
      }
    }
  }

  // Handle audio attachments - transcribe to text and add to content
  if (attachments?.some((a) => a.type === 'audio')) {
    const audioAttachments = attachments.filter((a) => a.type === 'audio');
    for (const audioAttachment of audioAttachments) {
      try {
        const transcribedText = await transcribeAudio(audioAttachment.url);
        // Add transcribed text to the last user message
        if (formattedMessages.length > 0 && formattedMessages[formattedMessages.length - 1].role === 'user') {
          const lastMessage = formattedMessages[formattedMessages.length - 1];
          
          if (Array.isArray(lastMessage.content)) {
            // If content is already an array (from images), append text
            lastMessage.content.push({
              type: 'text',
              text: `\n\n[Audio transcription]: ${transcribedText}`,
            });
          } else {
            // If content is still a string, append to it
            const existingContent = lastMessage.content as string;
            lastMessage.content = existingContent
              ? `${existingContent}\n\n[Audio transcription]: ${transcribedText}`
              : transcribedText;
          }
        } else {
          // If no user message exists, add a new one with the transcription
          formattedMessages.push({
            role: 'user',
            content: transcribedText,
          });
        }
      } catch (error) {
        console.error('Failed to transcribe audio:', error);
        // Don't throw - gracefully handle by adding a note to the message
        if (formattedMessages.length > 0 && formattedMessages[formattedMessages.length - 1].role === 'user') {
          const lastMessage = formattedMessages[formattedMessages.length - 1];
          
          if (Array.isArray(lastMessage.content)) {
            lastMessage.content.push({
              type: 'text',
              text: '\n\n[Note: Audio transcription failed. Please describe your symptoms in text.]',
            });
          } else {
            const existingContent = lastMessage.content as string;
            lastMessage.content = existingContent
              ? `${existingContent}\n\n[Note: Audio transcription failed. Please describe your symptoms in text.]`
              : 'I sent an audio message, but it could not be transcribed. Please describe your symptoms in text.';
          }
        } else {
          formattedMessages.push({
            role: 'user',
            content: 'I sent an audio message, but it could not be transcribed. Please describe your symptoms in text.',
          });
        }
      }
    }
  }

  // Add system message for medical context
  const systemMessage = {
    role: 'system',
    content:
      'You are a helpful medical assistant. Provide preliminary health information and recommendations based on symptoms. Always remind users to consult with healthcare professionals for proper diagnosis and treatment. Be empathetic , clear and very very concise in your responses. Respond in 200 words or less.',
  };

  const requestBody = {
    model,
    messages: [systemMessage, ...formattedMessages],
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Delphi Healthcare Platform',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
}

