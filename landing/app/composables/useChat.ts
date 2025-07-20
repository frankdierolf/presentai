import type { ChatResponse, MessagesResponse } from '@@/pocketbase-types';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created: string;
  reaction: 'liked' | 'disliked' | 'none';
}

export const useChat = () => {
  const { pb, user } = usePocketbase();
  const toast = useToast();
  const chats = ref<ChatResponse[]>([]);
  const isLoading = ref(true);
  const currentChat = ref<ChatResponse | null>(null);
  const messages = useState<Message[]>('chat-messages', () => []);

  const transformMessage = (msg: MessagesResponse): Message => ({
    id: msg.id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    created: msg.created,
    reaction: msg.reaction as 'liked' | 'disliked' | 'none',
  });

  const fetchChats = async () => {
    try {
      isLoading.value = true;
      chats.value = await pb.collection('chat').getFullList<ChatResponse>({
        sort: '-created',
        expand: 'user',
      });
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to fetch Chat',
        color: 'error',
      });
      throw createError('Failed to fetch chats');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchChat = async (id: string) => {
    try {
      isLoading.value = true;
      currentChat.value = await pb.collection('chat').getOne<ChatResponse>(id, {
        expand: 'messages',
      });
      await getChatMessages(id);
      return currentChat.value;
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to fetch chat',
        color: 'error',
      });
      throw createError('Failed to fetch chat');
    } finally {
      isLoading.value = false;
    }
  };

  const getChatMessages = async (chatId: string) => {
    try {
      isLoading.value = true;
      const response = await pb
        .collection('messages')
        .getFullList<MessagesResponse>({
          filter: `chat = "${chatId}"`,
          sort: 'created',
        });
      messages.value = response.map(transformMessage);
      return messages.value;
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to fetch messages',
        color: 'error',
      });
      throw createError('Failed to fetch messages');
    } finally {
      isLoading.value = false;
    }
  };
  const isMessageLoading = useState('isMessageLoading', () => false);
  const sendMessage = async (chatId: string, content: string) => {
    try {
      isMessageLoading.value = true;
      const isFirstMessage = messages.value.length === 0;

      // Create optimistic message with required fields
      const optimisticMessage: Message = {
        id: Math.random().toString(36).substring(2, 10),
        content,
        role: 'user',
        created: new Date().toISOString(),
        reaction: 'none',
      };

      messages.value.push(optimisticMessage);

      // Update chat title if this is the first message
      if (isFirstMessage && currentChat.value) {
        const truncatedTitle =
          content.length > 100 ? `${content.slice(0, 97)}...` : content;
        await pb.collection('chat').update(chatId, {
          title: truncatedTitle,
        });
        currentChat.value.title = truncatedTitle;
      }

      // Prepare clean message format for OpenAI API
      const apiMessages = messages.value.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to API for AI response
      const response = await $fetch<{ message: MessagesResponse }>(
        `${useRuntimeConfig().public.pocketbaseUrl}/ai-chat/${chatId}`,
        {
          method: 'POST',
          body: {
            messages: apiMessages,
          },
          headers: {
            Authorization: pb.authStore.token,
          },
        }
      );

      // Add AI response to messages
      if (response.message) {
        messages.value.push(transformMessage(response.message));
      }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to send message',
        color: 'error',
      });
      throw createError('Failed to send message');
    } finally {
      isMessageLoading.value = false;
    }
  };

  const createChat = async (formData: FormData) => {
    try {
      const chat = await pb.collection('chat').create(formData);
      return chat;
    } catch (error) {
      console.error(error);
      throw createError('Failed to create chat');
    }
  };

  const messageFeedback = async (
    messageId: string,
    reaction: 'liked' | 'disliked' | 'none'
  ) => {
    try {
      await pb.collection('messages').update(messageId, {
        reaction,
      });
      messages.value = [
        ...messages.value.map((msg) =>
          msg.id === messageId ? { ...msg, reaction } : msg
        ),
      ];
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to update reaction',
        color: 'error',
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await pb.collection('messages').delete(messageId);
      messages.value = [
        ...messages.value.filter((msg) => msg.id !== messageId),
      ];
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to delete message',
        color: 'error',
      });
    }
  };
  const loadingPublicChatLink = ref(false);
  const createPublicChat = async (
    title: string,
    messages: Message[],
    includeAuthorDetails: boolean
  ) => {
    try {
      loadingPublicChatLink.value = true;
      const chat = await pb.collection('publicChat').create({
        user: user.value?.id,
        title,
        messages,
        author: includeAuthorDetails
          ? {
              name: user.value?.name,
              avatarUrl: user.value?.avatarUrl,
            }
          : null,
      });
      return chat;
    } catch (error) {
      console.error(error);
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to create public chat',
        color: 'error',
      });
      throw createError('Failed to create public chat');
    } finally {
      loadingPublicChatLink.value = false;
    }
  };
  const deletingChatId = ref<string | null>(null);
  const deleteChat = async (chatId: string) => {
    try {
      deletingChatId.value = chatId;
      await pb.collection('chat').delete(chatId);
      chats.value = chats.value.filter((chat) => chat.id !== chatId);
    } catch (error) {
      console.error(error);
      toast.add({
        title: 'Error',
        description: error.data.message || 'Failed to delete chat',
        color: 'error',
      });
    } finally {
      deletingChatId.value = null;
    }
  };

  return {
    chats,
    currentChat,
    messages,
    isLoading,
    fetchChats,
    getChatMessages,
    createChat,
    fetchChat,
    sendMessage,
    messageFeedback,
    deleteMessage,
    createPublicChat,
    loadingPublicChatLink,
    deleteChat,
    deletingChatId,
  };
};
