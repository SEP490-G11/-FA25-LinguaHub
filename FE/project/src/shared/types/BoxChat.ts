
export interface ChatRoom {
    ChatRoomID: number;
    Title?: string;
    Description?: string;
    UserID: string;
    TutorID?: number;
    ChatRoomType: 'Advice' | 'Training';
}

export interface ChatRoomMessage {
    MessageID: number;
    ChatRoomID: number;
    SenderID: string;
    Content?: string;
    MessageType: 'Text' | 'Image' | 'File';
    CreatedAt: string;
}

export interface Policy {
    PolicyID: number;
    Title?: string;
    Description?: string;
    PolicyType: 'Commission' | 'Refund' | 'General';
    Value?: number;
    CreatedAt: string;
    IsActive: boolean;
}
