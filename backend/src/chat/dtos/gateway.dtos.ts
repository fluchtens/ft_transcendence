
export class SendMessageDto {
  userId: number;
  channelId: string;
  message: string;
}

export class Messages {
  userId: number;
  messageId: string;
  content: string;
  edited: boolean;
  constructor(messageId: string, content: string, edited: boolean, userId: number) {
    this.messageId = messageId;
    this.content = content;
    this.edited = edited;
    this.userId = userId;
  }
}

export class ChannelData {
  channelId: string;
  channelName: string;
  inviteCode?: string;
  messages: Messages [];
  members: any [];
}