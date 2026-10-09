import { type Draft } from "immer";

export interface Use<S> {
    <R>(
        selector: (state: S) => R,
        deps?: unknown[],
        isEqual?: (a: R, b: R) => boolean,
    ): R;
    (): S;
}

/**
 * 获取当前 State 快照
 * @return State 快照
 */
export type Get<S> = () => S;

/**
 * 更新方法
 */
export type UpdateFn<S> = (draft: Draft<S>) => S | void;

/**
 * 更新 State
 * @param reason 更新原因
 * @param updater 更新方法
 */
export type Update<S> = (
    reason: string,
    updater: Partial<S> | UpdateFn<S>,
) => void;

/**
 * 监听器
 */
export type Listener<S> = (newState: S, oldState: S) => void;

/**
 * 取消监听
 */
export type Unsubscribe = () => void;

/**
 * 监听数据变化
 * @param listener 监听回调函数
 * @return 取消监听函数
 */
export type Subscribe<S> = (listener: Listener<S>) => Unsubscribe;

/**
 * 模型操作句柄
 */
export interface Handler<S> {
    /**
     * 连接 State 与 React Component
     */
    use: Use<S>;

    /**
     * 获取当前 State 快照
     * @return State 快照
     */
    get: Get<S>;

    /**
     * 更新方法
     */
    update: Update<S>;

    /**
     * 监听数据变化
     * @param listener 监听回调函数
     * @return 取消监听函数
     */
    subscribe: Subscribe<S>;
}
