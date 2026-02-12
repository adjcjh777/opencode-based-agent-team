import { describe, expect, it } from 'vitest';

import { TaskBoard } from '../../../src/teams/task-board.js';
import type { Task } from '../../../src/teams/types.js';

function createTask(id: string, title: string): Task {
  return {
    id,
    title,
    description: `${title} description`,
    status: 'pending'
  };
}

describe('TaskBoard', () => {
  it('adds tasks and lists them', () => {
    const board = new TaskBoard();

    board.addTask(createTask('t1', 'Task 1'));
    board.addTask(createTask('t2', 'Task 2'));

    expect(board.list().map((task) => task.id)).toEqual(['t1', 't2']);
  });

  it('assigns a task and updates status to assigned', () => {
    const board = new TaskBoard();
    board.addTask(createTask('t1', 'Task 1'));

    board.assign('t1', 'teammate-1');

    expect(board.get('t1')).toMatchObject({
      assignee: 'teammate-1',
      status: 'assigned'
    });
  });

  it('updates task status and result', () => {
    const board = new TaskBoard();
    board.addTask(createTask('t1', 'Task 1'));

    board.updateStatus('t1', 'completed', 'done');

    expect(board.get('t1')).toMatchObject({
      status: 'completed',
      result: 'done'
    });
  });
});
