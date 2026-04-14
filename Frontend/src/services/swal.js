/**
 * DurgSetu AI — SweetAlert2 Helper
 * Centralized, branded Swal instance for the entire application.
 */
import Swal from 'sweetalert2';

// Branded Swal instance
const DSwal = Swal.mixin({
    customClass: {
        popup: 'ds-popup',
        title: 'ds-title',
        htmlContainer: 'ds-html',
        confirmButton: 'ds-confirm',
        cancelButton: 'ds-cancel',
        icon: 'ds-icon',
    },
    buttonsStyling: false,
    showClass: { popup: 'swal2-show' },
    hideClass: { popup: 'swal2-hide' },
});

export default DSwal;

/* ── Quick helpers ─────────────────────────────────────── */

/** Green success toast (top-right, auto-dismiss) */
export const successToast = (title, text) =>
    DSwal.fire({
        icon: 'success',
        title,
        text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

/** Red error toast (top-right, auto-dismiss) */
export const errorToast = (title, text) =>
    DSwal.fire({
        icon: 'error',
        title,
        text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
    });

/** Confirmation dialog — returns true if confirmed */
export const confirmDialog = async (title, text, confirmText = 'Confirm', color = '#f97316') => {
    const result = await DSwal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    });
    return result.isConfirmed;
};

/** Full-page success screen */
export const successScreen = (title, text) =>
    DSwal.fire({ icon: 'success', title, text });

/** Full-page error screen */
export const errorScreen = (title, text) =>
    DSwal.fire({ icon: 'error', title, text });
