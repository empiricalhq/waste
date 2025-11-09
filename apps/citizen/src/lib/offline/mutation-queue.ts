import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedMutation {
  id: string;
  mutationKey: string[];
  variables: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class MutationQueue {
  private queue: QueuedMutation[] = [];
  private readonly STORAGE_KEY = 'MUTATION_QUEUE';

  /**
   * Add a mutation to the queue
   */
  async add(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id: `mutation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedMutation);
    await this.persist();
    
    console.log(`Mutation queued: ${queuedMutation.id}`, queuedMutation.mutationKey);
  }

  /**
   * Remove a mutation from the queue
   */
  async remove(id: string): Promise<void> {
    this.queue = this.queue.filter((m) => m.id !== id);
    await this.persist();
    
    console.log(`Mutation removed from queue: ${id}`);
  }

  /**
   * Retry all queued mutations
   */
  async retryAll(mutationFn: (mutation: QueuedMutation) => Promise<void>): Promise<void> {
    const mutations = [...this.queue];
    
    console.log(`Retrying ${mutations.length} queued mutations`);

    for (const mutation of mutations) {
      try {
        await mutationFn(mutation);
        await this.remove(mutation.id);
        console.log(`Mutation succeeded: ${mutation.id}`);
      } catch (error) {
        mutation.retryCount++;
        console.error(`Mutation failed (attempt ${mutation.retryCount}/${mutation.maxRetries}):`, error);

        // Remove after max retries
        if (mutation.retryCount >= mutation.maxRetries) {
          await this.remove(mutation.id);
          console.error(`Mutation permanently failed after ${mutation.maxRetries} retries:`, mutation.id);
        } else {
          // Update retry count
          await this.persist();
        }
      }
    }
  }

  /**
   * Get the current queue
   */
  getQueue(): QueuedMutation[] {
    return [...this.queue];
  }

  /**
   * Get the number of pending mutations
   */
  getCount(): number {
    return this.queue.length;
  }

  /**
   * Clear all mutations from the queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
    console.log('Mutation queue cleared');
  }

  /**
   * Persist the queue to AsyncStorage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist mutation queue:', error);
    }
  }

  /**
   * Load the queue from AsyncStorage
   */
  async hydrate(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`Mutation queue hydrated: ${this.queue.length} mutations`);
      }
    } catch (error) {
      console.error('Failed to hydrate mutation queue:', error);
      this.queue = [];
    }
  }
}

// Export singleton instance
export const mutationQueue = new MutationQueue();
