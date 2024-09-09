// TODO: How can we make this stay in sync between `client` and `server`
/* eslint-disable @typescript-eslint/no-explicit-any */

export function isCreateRoomMessage(message: any): message is CreateRoomMessage {
  return message.type === 'create-room' && typeof message.nickname === 'string';
}

export function isJoinRoomMessage(message: any): message is JoinRoomMessage {
  return (
    message.type === 'join-room' &&
    typeof message.code === 'string' &&
    typeof message.nickname === 'string'
  );
}

export function isStartGameMessage(message: any): message is StartGameMessage {
  return message.type === 'start-game';
}

export function isSubmitPromptMessage(message: any): message is SubmitPromptMessage {
  return (
    message.type === 'submit-prompt' &&
    typeof message.spectrumId === 'string' &&
    typeof message.prompt === 'string'
  );
}

export function isProposeValueMessage(message: any): message is ProposeValueMessage {
  return message.type === 'propose-value' && typeof message.value === 'number';
}

export function isReadyUpMessage(message: any): message is ReadyUpMessage {
  return message.type === 'ready-up';
}

export function isClearReadyMessage(message: any): message is ClearReadyMessage {
  return message.type === 'clear-ready';
}

export function isProceedMessage(message: any): message is ProceedMessage {
  return message.type === 'proceed';
}

export function isClientMessage(message: any): message is ClientMessage {
  return (
    isCreateRoomMessage(message) ||
    isJoinRoomMessage(message) ||
    isStartGameMessage(message) ||
    isSubmitPromptMessage(message) ||
    isProposeValueMessage(message) ||
    isReadyUpMessage(message) ||
    isClearReadyMessage(message) ||
    isProceedMessage(message)
  );
}

export type CreateRoomMessage = {
  type: 'create-room';
  nickname: string;
};

export type JoinRoomMessage = {
  type: 'join-room';
  code: string;
  nickname: string;
};

export type StartGameMessage = {
  type: 'start-game';
};

export type SubmitPromptMessage = {
  type: 'submit-prompt';
  spectrumId: string;
  prompt: string;
};

export type ProposeValueMessage = {
  type: 'propose-value';
  value: number;
};

export type ReadyUpMessage = {
  type: 'ready-up';
};

export type ClearReadyMessage = {
  type: 'clear-ready';
};

export type ProceedMessage = {
  type: 'proceed';
};

export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | StartGameMessage
  | SubmitPromptMessage
  | ProposeValueMessage
  | ReadyUpMessage
  | ClearReadyMessage
  | ProceedMessage;

// From Server to Client

export type ClientGameState =
  | {
      state: 'lobby';
    }
  | {
      state: 'initializing';
      spectrums: ClientSpectrum[];
    }
  | {
      state: 'round-playing';
      spectrums: ClientSpectrum[];
      current: ClientSpectrum;
      ready: ClientPlayer[];
      proposedValue: number;
    }
  | { state: 'round-completed'; spectrums: ClientSpectrum[]; current: ClientSpectrum }
  | { state: 'results'; spectrums: ClientSpectrum[] };

export interface ClientSpectrum {
  id: string;
  left: string;
  right: string;
  correctValue?: number;
  submittedValue?: number;
  prompt?: string;
  assigned: ClientPlayer;
}

export interface ClientPlayer {
  id: string;
  name: string;
}

export type ServerSyncPayload = {
  you: ClientPlayer;
  state: ClientGameState;
  players: ClientPlayer[];
  code: string;
};

export type ServerSync = {
  type: 'sync';
  payload: ServerSyncPayload;
};

export type ServerMessage = ServerSync;

export function isSyncMessage(message: any): message is ServerSync {
  return message.type === 'sync' && 'payload' in message;
}
