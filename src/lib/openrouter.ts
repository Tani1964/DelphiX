import { ChatMessage } from '@/types';

/**
 * Analyze image using Google Cloud Vision API
 * Free tier: 1,000 requests per month
 * Requires GOOGLE_CLOUD_API_KEY environment variable
 */
async function analyzeImageWithGoogleVision(imageUrl: string): Promise<string> {
  try {
    let base64: string;
    
    // Handle data URLs (base64) - common in serverless environments like Vercel
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data from data URL: data:mime/type;base64,<data>
      const base64Match = imageUrl.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match && base64Match[1]) {
        base64 = base64Match[1];
      } else {
        throw new Error('Invalid data URL format');
      }
    }
    // Try to read from filesystem (development/local only)
    else if (imageUrl.startsWith('/uploads/')) {
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      const filepath = join(process.cwd(), 'public', imageUrl);
      try {
        const fileBuffer = await readFile(filepath);
        base64 = fileBuffer.toString('base64');
      } catch (fsError) {
        console.warn('Failed to read image from filesystem, trying HTTP fetch:', fsError);
        // Fallback to HTTP fetch
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const fullImageUrl = `${baseUrl}${imageUrl}`;
        const imageResponse = await fetch(fullImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image file: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        base64 = Buffer.from(arrayBuffer).toString('base64');
      }
    } else {
      // External URL or full URL
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${imageUrl}`;
      const imageResponse = await fetch(fullImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image file: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      base64 = Buffer.from(arrayBuffer).toString('base64');
    }

    // Get Google Cloud API key
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        'GOOGLE_CLOUD_API_KEY is required for image analysis. ' +
        'Please add GOOGLE_CLOUD_API_KEY to your environment variables. ' +
        'Get your API key from: https://console.cloud.google.com/apis/credentials'
      );
    }

    // Google Cloud Vision API endpoint
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10,
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 10,
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10,
            },
            {
              type: 'SAFE_SEARCH_DETECTION',
            },
          ],
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails: string;
      
      try {
        const errorData = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorData, null, 2);
      } catch {
        errorDetails = errorText || `HTTP ${response.status} ${response.statusText}`;
      }
      
      console.error('Google Vision API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
      });
      throw new Error(`Image analysis failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.responses || data.responses.length === 0) {
      throw new Error('No response from Vision API');
    }

    const visionResponse = data.responses[0];
    
    // Extract relevant information
    const labels = visionResponse.labelAnnotations?.map((label: { description: string; score: number }) => 
      `${label.description} (${Math.round(label.score * 100)}% confidence)`
    ).join(', ') || 'No labels detected';
    
    const text = visionResponse.textAnnotations?.[0]?.description || 'No text detected';
    
    const objects = visionResponse.localizedObjectAnnotations?.map((obj: { name: string; score: number }) => 
      `${obj.name} (${Math.round(obj.score * 100)}% confidence)`
    ).join(', ') || 'No objects detected';
    
    // Format the analysis result for medical context
    const analysisResult = `Image Analysis Results:
- Detected Objects/Labels: ${labels}
- Detected Text: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}
- Localized Objects: ${objects}
- Safe Search: ${visionResponse.safeSearchAnnotation ? 'Content appears safe' : 'Unable to verify safety'}

Please analyze these findings in the context of medical symptoms.`;
    
    return analysisResult;
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw error;
  }
}

/**
 * Transcribe audio file to text using OpenAI Whisper API
 * Note: OpenRouter does not support the /audio/transcriptions endpoint,
 * so we must use OpenAI API directly. OPENAI_API_KEY is required.
 */
async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    let fileBuffer: Buffer;
    let filename = 'audio.webm';
    
    // Handle data URLs (base64) - common in serverless environments like Vercel
    if (audioUrl.startsWith('data:')) {
      // Extract base64 data from data URL: data:mime/type;base64,<data>
      const base64Match = audioUrl.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match && base64Match[1]) {
        fileBuffer = Buffer.from(base64Match[1], 'base64');
        // Extract mime type to determine file extension
        const mimeMatch = audioUrl.match(/^data:([^;]+)/);
        if (mimeMatch && mimeMatch[1]) {
          const mimeType = mimeMatch[1];
          if (mimeType.includes('webm')) {
            filename = 'audio.webm';
          } else if (mimeType.includes('mp3')) {
            filename = 'audio.mp3';
          } else if (mimeType.includes('wav')) {
            filename = 'audio.wav';
          } else if (mimeType.includes('m4a')) {
            filename = 'audio.m4a';
          }
        }
      } else {
        throw new Error('Invalid data URL format for audio');
      }
    }
    // Try to read from filesystem (development/local only)
    else if (audioUrl.startsWith('/uploads/')) {
      const { readFile } = await import('fs/promises');
      const { join, basename } = await import('path');
      const filepath = join(process.cwd(), 'public', audioUrl);
      try {
        fileBuffer = await readFile(filepath);
        filename = basename(audioUrl);
      } catch (fsError) {
        console.warn('Failed to read audio from filesystem, trying HTTP fetch:', fsError);
        // Fallback to HTTP fetch
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const fullAudioUrl = `${baseUrl}${audioUrl}`;
        const audioResponse = await fetch(fullAudioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio file: ${audioResponse.status} ${audioResponse.statusText}`);
        }
        const audioBlob = await audioResponse.blob();
        const arrayBuffer = await audioBlob.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      // External URL or full URL
      const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${audioUrl}`;
      const audioResponse = await fetch(fullAudioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio file: ${audioResponse.status} ${audioResponse.statusText}`);
      }
      const audioBlob = await audioResponse.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    }
    
    // Create FormData - in Node.js 18+, FormData accepts Buffer directly
    const formData = new FormData();
    // Convert Buffer to Uint8Array for File constructor
    const uint8Array = new Uint8Array(fileBuffer);
    const file = new File([uint8Array], filename, { type: 'audio/webm' });
    formData.append('file', file);
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
  // Default to Gemini 2.5 Flash for better text conversation (images handled separately by Google Vision)
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

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

  // Handle image attachments - analyze with Google Vision API
  // Images are processed separately and results are added as text to the conversation
  // This must be done before audio to avoid type conflicts
  if (attachments?.some((a) => a.type === 'image')) {
    const imageAttachments = attachments.filter((a) => a.type === 'image');
    if (imageAttachments.length > 0 && formattedMessages.length > 0) {
      const lastMessage = formattedMessages[formattedMessages.length - 1];
      if (lastMessage.role === 'user') {
        // Analyze each image with Google Vision API
        const imageAnalyses: string[] = [];
        
        for (const imageAttachment of imageAttachments) {
          try {
            const analysisResult = await analyzeImageWithGoogleVision(imageAttachment.url);
            imageAnalyses.push(analysisResult);
          } catch (error) {
            console.error('Failed to analyze image with Google Vision:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            // Include error details in the fallback message
            imageAnalyses.push(
              `[Note: Image analysis failed (${errorMessage}). ` +
              `Please ensure GOOGLE_CLOUD_API_KEY is set and the image is accessible. ` +
              `Please describe the image in text.]`
            );
          }
        }
        
        // Combine image analysis results with existing text content
        const existingContent = typeof lastMessage.content === 'string' 
          ? lastMessage.content 
          : '';
        
        const imageAnalysisText = imageAnalyses.join('\n\n---\n\n');
        const combinedContent = existingContent
          ? `${existingContent}\n\n[Image Analysis]:\n${imageAnalysisText}`
          : `[User has attached ${imageAttachments.length} image(s) for analysis]\n\n${imageAnalysisText}`;
        
        lastMessage.content = combinedContent;
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Don't throw - gracefully handle by adding a note to the message
        if (formattedMessages.length > 0 && formattedMessages[formattedMessages.length - 1].role === 'user') {
          const lastMessage = formattedMessages[formattedMessages.length - 1];
          
          const failureNote = `\n\n[Note: Audio transcription failed (${errorMessage}). ` +
            `Please ensure OPENAI_API_KEY is set and the audio file is accessible. ` +
            `Please describe your symptoms in text.]`;
          
          if (Array.isArray(lastMessage.content)) {
            lastMessage.content.push({
              type: 'text',
              text: failureNote,
            });
          } else {
            const existingContent = lastMessage.content as string;
            lastMessage.content = existingContent
              ? `${existingContent}${failureNote}`
              : `I sent an audio message, but it could not be transcribed (${errorMessage}). Please describe your symptoms in text.`;
          }
        } else {
          formattedMessages.push({
            role: 'user',
            content: `I sent an audio message, but it could not be transcribed (${errorMessage}). Please describe your symptoms in text.`,
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
        'X-Title': 'DelphiX Healthcare Platform',
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

