import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getDiagnosisFromAI } from '@/lib/openrouter';
import { getDiagnosesCollection } from '@/lib/mongodb';
import { Diagnosis, ChatMessage } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, messages, attachment, diagnosisId } = await request.json();

    // Get or create diagnosis record
    const diagnoses = await getDiagnosesCollection();
    let diagnosis: Diagnosis | null = null;

    if (diagnosisId) {
      diagnosis = (await diagnoses.findOne({
        _id: new ObjectId(diagnosisId),
        userId: session.user.id,
      })) as Diagnosis | null;
    }

    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message || 'Sent an attachment',
      timestamp: new Date(),
      attachment: attachment
        ? {
            type: attachment.type,
            url: attachment.url,
          }
        : undefined,
    };

    const chatHistory: ChatMessage[] = diagnosis
      ? [...diagnosis.chatHistory, userMessage]
      : [userMessage];

    // Get AI response
    let aiResponse: string;
    try {
      aiResponse = await getDiagnosisFromAI(chatHistory, attachment ? [attachment] : undefined);
    } catch (error) {
      console.error('Error in getDiagnosisFromAI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process diagnosis: ${errorMessage}`);
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    const updatedChatHistory = [...chatHistory, assistantMessage];

    // Extract symptoms from first user message
    const symptoms = diagnosis
      ? diagnosis.symptoms
      : chatHistory.find((m) => m.role === 'user')?.content || message;

    // Update or create diagnosis
    if (diagnosis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        $set: {
          chatHistory: updatedChatHistory,
          diagnosis: aiResponse,
          updatedAt: new Date(),
        },
      };
      
      if (attachment) {
        updateData.$push = {
          attachments: {
            type: attachment.type,
            url: attachment.url,
          },
        };
      }
      
      await diagnoses.updateOne(
        { _id: new ObjectId(diagnosisId) },
        updateData
      );
    } else {
      const newDiagnosis: Omit<Diagnosis, '_id'> = {
        userId: session.user.id,
        symptoms,
        diagnosis: aiResponse,
        chatHistory: updatedChatHistory,
        attachments: attachment ? [attachment] : [],
        createdAt: new Date(),
      };

      const result = await diagnoses.insertOne(newDiagnosis);
      diagnosis = {
        ...newDiagnosis,
        _id: result.insertedId.toString(),
      } as Diagnosis;
    }

    return NextResponse.json({
      response: aiResponse,
      diagnosisId: diagnosis._id,
    });
  } catch (error) {
    console.error('Chat diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to get diagnosis' },
      { status: 500 }
    );
  }
}

