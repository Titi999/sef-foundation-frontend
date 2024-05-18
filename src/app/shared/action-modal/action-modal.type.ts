export enum ActionModalIllustration {
  success = 'success',
  delete = 'delete',
  deactivate = 'deactivate',
  activate = 'activate',
}

export interface ActionModalData {
  actionIllustration: ActionModalIllustration;
  title: string;
  actionColor: ActionModalColor;
  subtext: string;
  actionType: ActionType;
  decisionText?: string;
}

export type ActionModalColor = 'primary' | 'warn';
export type ActionType = 'decision' | 'close';
