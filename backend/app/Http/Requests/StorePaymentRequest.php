<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // We'll handle authorization in the controller or middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'enrollment_id' => 'required|exists:enrollments,id',
            'amount' => 'required|numeric|min:0',
            'month' => 'required|integer|min:1',
            'payment_proof' => 'nullable|string',
            'payment_date' => 'required|date',
            'admin_notes' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'enrollment_id.required' => 'Enrollment ID is required',
            'enrollment_id.exists' => 'Selected enrollment does not exist',
            'amount.required' => 'Payment amount is required',
            'amount.numeric' => 'Payment amount must be a number',
            'amount.min' => 'Payment amount must be greater than or equal to 0',
            'month.required' => 'Payment month is required',
            'month.integer' => 'Payment month must be an integer',
            'month.min' => 'Payment month must be at least 1',
            'payment_date.required' => 'Payment date is required',
            'payment_date.date' => 'Payment date must be a valid date'
        ];
    }
}
