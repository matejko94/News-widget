import { merge, ObservableInput, ObservedValueOf, of, OperatorFunction, switchMap } from 'rxjs';

export function loadingMap<T, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O> | undefined> {
    return switchMap((value: T, index: number) =>
        merge(
            of(undefined),
            project(value, index)
        )
    );
}
