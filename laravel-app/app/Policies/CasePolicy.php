<?php

namespace App\Policies;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CasePolicy
{
    /**
     * Determine whether the user can view any cases.
     * Admin and Viewer can view.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VIEWER]);
    }

    /**
     * Determine whether the user can view the case details.
     */
    public function view(User $user, MedicalCase $case): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VIEWER]);
    }

    /**
     * Determine whether the user can create cases.
     * Admin only. Viewer returns 403 Forbidden.
     */
    public function create(User $user): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can create cases.', 403);
    }

    /**
     * Determine whether the user can update the case.
     */
    public function update(User $user, MedicalCase $case): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can edit cases.', 403);
    }

    /**
     * Determine whether the user can change status.
     */
    public function changeStatus(User $user, MedicalCase $case): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can modify case status.', 403);
    }

    /**
     * Determine whether the user can delete the case.
     * Viewer cannot delete (returns 403).
     */
    public function delete(User $user, MedicalCase $case): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can delete cases.', 403);
    }
}
