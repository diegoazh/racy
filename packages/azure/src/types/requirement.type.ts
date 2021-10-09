import { RequirementStatus } from '@requirement/constants/requirement.constant';
import { ICountResult } from '@shared/interfaces/app-responses.interface';

export type RequirementStatusValue =
  typeof RequirementStatus[keyof typeof RequirementStatus];
export type ICountStatuses = {
  [key in RequirementStatusValue]: ICountResult;
};
