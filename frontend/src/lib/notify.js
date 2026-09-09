import { toast } from 'react-toastify';

const options = { position: 'top-right', autoClose: 4200 };

/**
 * Suppress raw database / internal errors from showing as red toast notifications.
 */
const isDatabaseOrInternalError = (msg) => {
  if (!msg || typeof msg !== 'string') return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes('sequelize') ||
    lower.includes('postgresql') ||
    lower.includes('database') ||
    lower.includes('econnrefused') ||
    lower.includes('connection refused') ||
    lower.includes('failed to fetch') ||
    lower.includes('unhandled rejection') ||
    lower.includes('syntax error at or near')
  );
};

export const notify = {
  success: (message) => toast.success(message, options),
  error: (message) => {
    if (isDatabaseOrInternalError(message)) return;
    return toast.error(message, { ...options, autoClose: 6000 });
  },
  info: (message) => toast.info(message, options),
  warning: (message) => toast.warning(message, options),
};
