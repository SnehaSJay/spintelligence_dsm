import apiConfig from './apiConfig';

/* ===== Process Parameter ===== */
export const mixingProcessParameterDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/qc', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

export const updateMixingProcessParameterEntry = async (qcId, payload) => {
    try {
        const response = await apiConfig.put(`/mixing/qc/${qcId}`, payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

export const getMixingProcessParameterEntries = async (params = {}) => {
    try {
        const response = await apiConfig.get('/mixing/qc', params);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Failed to load Mixing QC entries.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== Cotton HVI ===== */
export const mixingCottonHVIDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/cotton-hvi', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== Fibre ===== */
export const mixingFibreDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/fibre', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== AFIS ===== */
export const mixingAfisDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/afis', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== Moisture ===== */
export const mixingMoistureDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/moisture', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== BR Waste Study ===== */
export const mixingBrWasteStudyEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/br-waste', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== Drop Test (single tuft per call) ===== */
export const mixingDropTestDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/drop-test', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};

/* ===== Openness ===== */
export const mixingOpennessDataEntry = async (payload) => {
    try {
        const response = await apiConfig.post('/mixing/openness', payload);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw new Error(error.response.data.message || 'Invalid payload.');
        throw new Error(error.message || 'Server error occurred');
    }
};
