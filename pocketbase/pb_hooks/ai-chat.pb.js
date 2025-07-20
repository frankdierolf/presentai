/// <reference path="../pb_data/types.d.ts" />

routerAdd('POST', '/ai-chat/{chatId}', async (e) => {
  const chatId = e.request.pathValue("chatId")
  const apiKey = $os.getenv("OPENAI_API_KEY");
  const info = e.requestInfo();
  const token = info.headers['authorization'] || '';

  try {
    // Validate API key exists
    if (!apiKey) {
      throw new BadRequestError('OpenAI API key not configured');
    }

    const userRecord = await $app.findAuthRecordByToken(token, 'auth');
    if (!userRecord) {
      throw new BadRequestError('Unauthorized request');
    }

    const data = info.body;
    if (!data.messages || data.messages.length === 0) {
      throw new BadRequestError('Messages array cannot be empty');
    }

    // Make OpenAI API request
    const response = await $http.send({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: data.messages,
      }),
    });

    if (response.statusCode !== 200) {
      $app.logger().error('OpenAI API Error:', {
        status: response.statusCode,
        response: response.json,
        headers: response.headers
      });
      const errorMessage = response.json?.error?.message || 'Unknown OpenAI API error';
      throw new BadRequestError(`Failed to get chat completion: ${errorMessage}`);
    }

    const assistantResponse = response.json.choices[0].message.content;

    // Save user message
    const messagesCollection = $app.findCollectionByNameOrId('messages');
    const userMessage = new Record(messagesCollection);
    userMessage.set('content', data.messages[data.messages.length - 1].content);
    userMessage.set('role', data.messages[data.messages.length - 1].role);
    userMessage.set('chat', chatId);
    userMessage.set('user', userRecord.id);
    $app.save(userMessage);

    // Save assistant message
    const assistantMessage = new Record(messagesCollection);
    assistantMessage.set('content', assistantResponse);
    assistantMessage.set('role', 'assistant');
    assistantMessage.set('chat', chatId);
    assistantMessage.set('user', userRecord.id);
    $app.save(assistantMessage);

    return e.json(200, {
      message: {
        role: 'assistant',
        content: assistantResponse
      }
    });
  } catch (error) {
    $app.logger().error('Error in AI chat:', error);
    console.error('Error in AI chat:', error);
    
    if (error instanceof BadRequestError) {
      return e.json(400, { message: error.message });
    }
    
    return e.json(500, { message: 'Failed to process chat request' });
  }
});
