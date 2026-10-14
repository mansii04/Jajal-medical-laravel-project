<?php

namespace App\Http\Requests;

use App\Models\MedicalCase;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $case = $this->route('case');
        return $this->user() && $this->user()->can('update', $case);
    }

    public function rules(): array
    {
        $caseId = $this->route('case') instanceof MedicalCase 
            ? $this->route('case')->id 
            : $this->route('case');

        return [
            'case_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('medical_cases', 'case_number')->ignore($caseId),
            ],
            'patient_reference' => ['required', 'string', 'max:50'],
            'surgeon_name' => ['required', 'string', 'max:100'],
            'implant_type' => ['required', 'string', 'max:150'],
            'status' => ['required', 'string', Rule::in(MedicalCase::STATUSES)],
            'priority' => ['required', 'string', Rule::in(MedicalCase::PRIORITIES)],
            'surgery_date' => ['nullable', 'date'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        if ($this->expectsJson()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422));
        }

        parent::failedValidation($validator);
    }
}
