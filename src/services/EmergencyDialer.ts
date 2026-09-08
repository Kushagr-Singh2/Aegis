/**
 * AEGIS EmergencyDialer — Android ACTION_DIAL Service Abstraction
 *
 * Exposes EmergencyDialer interface from src/services for unified native service access.
 *
 * STRICT ANDROID COMPLIANCE:
 * - Uses Intent.ACTION_DIAL with tel:{number}
 * - NEVER uses Intent.ACTION_CALL
 * - NEVER requests CALL_PHONE permission
 * - User must manually confirm and press Call on the Android dialer.
 */

export { EmergencyDialer, type DialerCallback, type DialerCallbackResult } from '../lib/EmergencyDialer';
