// hooks/useFormInput.ts
import { useState, KeyboardEvent, ChangeEvent, FormEvent } from 'react';

type SubmitCallback<T = any> = (data: T) => void;

type UseFormInputProps<T = any> = {
    initialValue?: string;
    fieldName?: string; // Tên trường (dish, type, query, etc.)
    onSubmit?: SubmitCallback<T>;
    preventShiftEnterSubmit?: boolean;
    resetOnSubmit?: boolean;
};

export function useFormInput<T = any>({
                                          initialValue = '',
                                          fieldName, // Tên trường sẽ được sử dụng trong đối tượng submit
                                          onSubmit,
                                          preventShiftEnterSubmit = true,
                                          resetOnSubmit = true
                                      }: UseFormInputProps<T> = {}) {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Ngăn submit khi Shift+Enter
        if (e.key === 'Enter') {
            if (e.shiftKey && preventShiftEnterSubmit) {
                e.preventDefault(); // Ngăn chặn submit
                // Nếu là textarea, không cần làm gì vì textarea tự động xử lý xuống dòng
            } else if (onSubmit && value.trim()) {
                e.preventDefault();
                // Nếu có fieldName, tạo đối tượng với fieldName làm key
                // Nếu không, truyền trực tiếp value
                const submitData = fieldName ? { [fieldName]: value } as unknown as T : value as unknown as T;
                onSubmit(submitData);
                if (resetOnSubmit) {
                    setValue('');
                }
            }
        }
    };

    // Helper để tạo submit handler cho form
    const createSubmitHandler = (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!value.trim() || !onSubmit) return;

        const submitData = fieldName ? { [fieldName]: value } as unknown as T : value as unknown as T;
        onSubmit(submitData);

        if (resetOnSubmit) {
            setValue('');
        }
    };

    return {
        value,
        setValue,
        handleChange,
        handleKeyDown,
        handleSubmit: createSubmitHandler,
        inputProps: {
            value,
            onChange: handleChange,
            onKeyDown: handleKeyDown
        }
    };
}