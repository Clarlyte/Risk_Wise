import { StyleSheet } from 'react-native';

export const inputStyles = StyleSheet.create({
  // Layout & Container Styles
  safeArea: {
    flex: 1,
    backgroundColor: '#FC7524',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F1F9',
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    marginBottom: 80,
  },

  // Input & Form Styles
  inputContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  controlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },

  // Section Styles
  inputSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  controlSection: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  controlItem: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },

  // Hazard Section Styles
  hazardSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  hazardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hazardDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },

  // Risk Assessment Styles
  riskSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  riskSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  riskScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    minWidth: 50,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 160,
    textAlign: 'center',
  },

  // Control Styles
  addControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Item Styles
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFCC80',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  // Button Styles
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#1294D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    gap: 12,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Label Styles
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  // Note: itemContainer had different background colors in different files
  // You might want to create specific versions:
  hazardItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderColor: '#FFCC80',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  controlItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFCC80',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
}); 