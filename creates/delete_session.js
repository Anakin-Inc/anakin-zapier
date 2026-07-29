// Delete Session
// Permanently deletes a saved browser session and its encrypted login data (synchronous, irreversible)

const perform = async (z, bundle) => {
  const { sessionId } = bundle.inputData;

  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  z.console.log(`Deleting browser session: ${sessionId}`);

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/sessions/${encodeURIComponent(sessionId.trim())}`,
    method: 'DELETE',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('Browser session deleted successfully');

  return {
    success: true,
    operation: 'deleteSession',
    session_id: sessionId.trim(),
    ...data,
  };
};

module.exports = {
  key: 'delete_session',
  noun: 'Browser Session',
  display: {
    label: 'Delete Session',
    description: 'Permanently deletes a saved browser session and its encrypted login data. Irreversible - you must log in again through the Anakin dashboard to recreate it, and any monitors or requests referencing this Session ID will lose authenticated access. Find IDs with List Sessions.',
  },

  operation: {
    inputFields: [
      {
        key: 'sessionId',
        label: 'Session ID',
        type: 'string',
        required: true,
        helpText: 'The session ID to delete (from the List Sessions action).',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'deleteSession',
      session_id: 'session_123456',
      deleted: true,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'session_id', label: 'Session ID', type: 'string' },
    ],
  },
};
