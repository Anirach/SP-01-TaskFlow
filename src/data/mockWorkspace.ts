import { WorkspaceFixture } from '../types/taskflow';
import {
  CURRENT_MEMBER_ID,
  INITIAL_DEFAULT_VIEW,
  mockMembers,
  WORKSPACE_NAME,
} from './mockMembers';
import { mockProjects } from './mockProjects';
import { mockTasks } from './mockTasks';
import { mockComments } from './mockComments';

export const initialWorkspaceFixture: WorkspaceFixture = {
  workspaceName: WORKSPACE_NAME,
  currentMemberId: CURRENT_MEMBER_ID,
  defaultView: INITIAL_DEFAULT_VIEW,
  members: mockMembers,
  projects: mockProjects,
  tasks: mockTasks,
  comments: mockComments,
};
