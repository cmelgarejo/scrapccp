import queue from 'async/queue'
import logger from './logger'

export const createQueue = taskProcessor => {
  const q = queue(taskProcessor, 10)

  q.drain = () => {
    // drain is called when the last item from the queue has
    // called its callback function
    logger.info('Last item has been processed.')
  }
  q.empty = () => {
    // empty is called when the last item from the queue is
    // given to a worker. Note: empty will be called prior to drain!
    logger.info('Last item has been submitted for processing.')
  }
  return q
}

export const addTaskToQueue = (_queue, task) => {
  _queue.push(task.func, error => {
    if (error) {
      logger.error(`Error adding ${task.name} to queue: ${error}`)
      return
    }
    logger.info(`${task.name} was successfully added to queue`)
  })
}
