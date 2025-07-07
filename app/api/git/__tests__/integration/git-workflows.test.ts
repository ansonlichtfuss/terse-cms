/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the git library
vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

// Import all Git API route handlers
import { GET as getStatus } from '../../status/route';
import { POST as postCommit } from '../../commit/route';
import { POST as postStage } from '../../stage/route';
import { POST as postSwitchBranch } from '../../switch-branch/route';
import { POST as postRevert } from '../../revert/route';
import { GET as getHistory } from '../../history/route';

describe('Git Workflows Integration Tests', () => {
  let mockGitInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a comprehensive mock git instance
    mockGitInstance = {
      status: vi.fn(),
      add: vi.fn(),
      commit: vi.fn(),
      checkout: vi.fn(),
      reset: vi.fn(),
      clean: vi.fn(),
      log: vi.fn(),
      show: vi.fn()
    };

    vi.mocked(createGitInstance).mockResolvedValue(mockGitInstance);
  });

  describe('Complete Commit Workflow', () => {
    it('should complete a full commit workflow: status -> stage -> commit -> status', async () => {
      // 1. Initial status check - dirty repository
      mockGitInstance.status.mockResolvedValueOnce({
        modified: ['test.md'],
        not_added: ['new-file.md'],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => false
      });

      const statusRequest1 = new NextRequest('http://localhost/api/git/status');
      const statusResponse1 = await getStatus(statusRequest1);
      
      expect(statusResponse1.status).toBe(200);
      const statusData1 = await statusResponse1.json();
      expect(statusData1.isClean).toBe(false);
      expect(statusData1.modifiedFiles).toContain('test.md');
      expect(statusData1.modifiedFiles).toContain('new-file.md');

      // 2. Stage files
      mockGitInstance.add.mockResolvedValueOnce(undefined);

      const stageRequest = new NextRequest('http://localhost/api/git/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const stageResponse = await postStage(stageRequest);
      
      expect(stageResponse.status).toBe(200);
      const stageData = await stageResponse.json();
      expect(stageData.success).toBe(true);
      expect(mockGitInstance.add).toHaveBeenCalledWith('.');

      // 3. Commit changes
      const mockCommitResult = {
        commit: 'abc123',
        summary: {
          changes: 2,
          insertions: 10,
          deletions: 2
        }
      };
      mockGitInstance.add.mockResolvedValueOnce(undefined);
      mockGitInstance.commit.mockResolvedValueOnce(mockCommitResult);

      const commitRequest = new NextRequest('http://localhost/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message: 'Add new feature' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const commitResponse = await postCommit(commitRequest);
      
      expect(commitResponse.status).toBe(200);
      const commitData = await commitResponse.json();
      expect(commitData.success).toBe(true);
      expect(commitData.commit).toEqual(mockCommitResult);

      // 4. Final status check - clean repository
      mockGitInstance.status.mockResolvedValueOnce({
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      });

      const statusRequest2 = new NextRequest('http://localhost/api/git/status');
      const statusResponse2 = await getStatus(statusRequest2);
      
      expect(statusResponse2.status).toBe(200);
      const statusData2 = await statusResponse2.json();
      expect(statusData2.isClean).toBe(true);
      expect(statusData2.modifiedFiles).toHaveLength(0);
    });
  });

  describe('Branch Switching Workflow', () => {
    it('should complete branch switching workflow: status -> switch -> status', async () => {
      // 1. Check status - clean repository
      mockGitInstance.status.mockResolvedValueOnce({
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      });

      const statusRequest = new NextRequest('http://localhost/api/git/status');
      const statusResponse = await getStatus(statusRequest);
      
      expect(statusResponse.status).toBe(200);
      const statusData = await statusResponse.json();
      expect(statusData.isClean).toBe(true);

      // 2. Switch branch
      mockGitInstance.status.mockResolvedValueOnce({
        files: []
      });
      mockGitInstance.checkout.mockResolvedValueOnce(undefined);

      const switchRequest = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify({ branchName: 'feature-branch' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const switchResponse = await postSwitchBranch(switchRequest);
      
      expect(switchResponse.status).toBe(200);
      const switchData = await switchResponse.json();
      expect(switchData.success).toBe(true);
      expect(switchData.message).toBe('Switched to branch feature-branch');

      // 3. Verify branch switch worked (status should still be clean)
      mockGitInstance.status.mockResolvedValueOnce({
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      });

      const statusRequest2 = new NextRequest('http://localhost/api/git/status');
      const statusResponse2 = await getStatus(statusRequest2);
      
      expect(statusResponse2.status).toBe(200);
      const statusData2 = await statusResponse2.json();
      expect(statusData2.isClean).toBe(true);
    });

    it('should prevent branch switching when changes are pending', async () => {
      // 1. Check status - dirty repository
      mockGitInstance.status.mockResolvedValueOnce({
        modified: ['test.md'],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => false
      });

      const statusRequest = new NextRequest('http://localhost/api/git/status');
      const statusResponse = await getStatus(statusRequest);
      
      expect(statusResponse.status).toBe(200);
      const statusData = await statusResponse.json();
      expect(statusData.isClean).toBe(false);

      // 2. Attempt to switch branch should fail
      mockGitInstance.status.mockResolvedValueOnce({
        files: ['test.md']
      });

      const switchRequest = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify({ branchName: 'feature-branch' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const switchResponse = await postSwitchBranch(switchRequest);
      
      expect(switchResponse.status).toBe(409);
      const switchData = await switchResponse.json();
      expect(switchData.error).toBe('Pending changes detected. Please commit or stash them before switching branches.');
    });
  });

  describe('Revert Workflow', () => {
    it('should complete revert workflow: status -> revert -> status', async () => {
      // 1. Check status - dirty repository
      mockGitInstance.status.mockResolvedValueOnce({
        modified: ['test.md'],
        not_added: ['new-file.md'],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => false
      });

      const statusRequest1 = new NextRequest('http://localhost/api/git/status');
      const statusResponse1 = await getStatus(statusRequest1);
      
      expect(statusResponse1.status).toBe(200);
      const statusData1 = await statusResponse1.json();
      expect(statusData1.isClean).toBe(false);

      // 2. Revert changes
      mockGitInstance.reset.mockResolvedValueOnce(undefined);
      mockGitInstance.clean.mockResolvedValueOnce(undefined);

      const revertRequest = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const revertResponse = await postRevert(revertRequest);
      
      expect(revertResponse.status).toBe(200);
      const revertData = await revertResponse.json();
      expect(revertData.success).toBe(true);
      expect(revertData.message).toBe('Changes reverted');

      // 3. Check status - should be clean
      mockGitInstance.status.mockResolvedValueOnce({
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      });

      const statusRequest2 = new NextRequest('http://localhost/api/git/status');
      const statusResponse2 = await getStatus(statusRequest2);
      
      expect(statusResponse2.status).toBe(200);
      const statusData2 = await statusResponse2.json();
      expect(statusData2.isClean).toBe(true);
    });
  });

  describe('History Workflow', () => {
    it('should retrieve file history after commit workflow', async () => {
      // 1. Make a commit first
      const mockCommitResult = {
        commit: 'abc123',
        summary: {
          changes: 1,
          insertions: 5,
          deletions: 0
        }
      };
      mockGitInstance.add.mockResolvedValueOnce(undefined);
      mockGitInstance.commit.mockResolvedValueOnce(mockCommitResult);

      const commitRequest = new NextRequest('http://localhost/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message: 'Add test file' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const commitResponse = await postCommit(commitRequest);
      
      expect(commitResponse.status).toBe(200);

      // 2. Get history for the file
      const mockLog = {
        all: [
          {
            hash: 'abc123',
            message: 'Add test file',
            author_name: 'John Doe',
            date: '2023-01-01T00:00:00Z'
          }
        ]
      };
      mockGitInstance.log.mockResolvedValueOnce(mockLog);
      mockGitInstance.show.mockResolvedValueOnce(`abc123 Add test file
 test.md | 5 +++++
 1 file changed, 5 insertions(+)`);

      const historyRequest = new NextRequest('http://localhost/api/git/history?filePath=test.md');
      const historyResponse = await getHistory(historyRequest);
      
      expect(historyResponse.status).toBe(200);
      const historyData = await historyResponse.json();
      expect(historyData).toHaveLength(1);
      expect(historyData[0].hash).toBe('abc123');
      expect(historyData[0].message).toBe('Add test file');
      expect(historyData[0].changes.insertions).toBe(5);
    });
  });

  describe('Complex Workflow Scenarios', () => {
    it('should handle commit -> branch switch -> commit workflow', async () => {
      // 1. Initial commit
      const mockCommitResult1 = {
        commit: 'abc123',
        summary: { changes: 1, insertions: 5, deletions: 0 }
      };
      mockGitInstance.add.mockResolvedValueOnce(undefined);
      mockGitInstance.commit.mockResolvedValueOnce(mockCommitResult1);

      const commitRequest1 = new NextRequest('http://localhost/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message: 'Initial commit' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const commitResponse1 = await postCommit(commitRequest1);
      expect(commitResponse1.status).toBe(200);

      // 2. Switch branch (clean state)
      mockGitInstance.status.mockResolvedValueOnce({ files: [] });
      mockGitInstance.checkout.mockResolvedValueOnce(undefined);

      const switchRequest = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify({ branchName: 'feature' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const switchResponse = await postSwitchBranch(switchRequest);
      expect(switchResponse.status).toBe(200);

      // 3. Another commit on new branch
      const mockCommitResult2 = {
        commit: 'def456',
        summary: { changes: 1, insertions: 3, deletions: 0 }
      };
      mockGitInstance.add.mockResolvedValueOnce(undefined);
      mockGitInstance.commit.mockResolvedValueOnce(mockCommitResult2);

      const commitRequest2 = new NextRequest('http://localhost/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message: 'Feature commit' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const commitResponse2 = await postCommit(commitRequest2);
      expect(commitResponse2.status).toBe(200);

      // Verify all operations completed successfully
      const commitData1 = await commitResponse1.json();
      const switchData = await switchResponse.json();
      const commitData2 = await commitResponse2.json();

      expect(commitData1.success).toBe(true);
      expect(switchData.success).toBe(true);
      expect(commitData2.success).toBe(true);
    });

    it('should handle stage -> revert workflow', async () => {
      // 1. Stage some files
      mockGitInstance.add.mockResolvedValueOnce(undefined);

      const stageRequest = new NextRequest('http://localhost/api/git/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const stageResponse = await postStage(stageRequest);
      expect(stageResponse.status).toBe(200);

      // 2. Revert all changes (including staged ones)
      mockGitInstance.reset.mockResolvedValueOnce(undefined);
      mockGitInstance.clean.mockResolvedValueOnce(undefined);

      const revertRequest = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const revertResponse = await postRevert(revertRequest);
      expect(revertResponse.status).toBe(200);

      // 3. Check final status
      mockGitInstance.status.mockResolvedValueOnce({
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      });

      const statusRequest = new NextRequest('http://localhost/api/git/status');
      const statusResponse = await getStatus(statusRequest);
      expect(statusResponse.status).toBe(200);

      const statusData = await statusResponse.json();
      expect(statusData.isClean).toBe(true);
    });
  });

  describe('Error Handling Across Workflows', () => {
    it('should handle git instance failures across different operations', async () => {
      // Test that all operations fail gracefully when git instance creation fails
      vi.mocked(createGitInstance).mockRejectedValue(new Error('Git instance creation failed'));

      const statusRequest = new NextRequest('http://localhost/api/git/status');
      const statusResponse = await getStatus(statusRequest);
      expect(statusResponse.status).toBe(500);

      const commitRequest = new NextRequest('http://localhost/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const commitResponse = await postCommit(commitRequest);
      expect(commitResponse.status).toBe(500);

      const switchRequest = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify({ branchName: 'test' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const switchResponse = await postSwitchBranch(switchRequest);
      expect(switchResponse.status).toBe(500);
    });
  });
});