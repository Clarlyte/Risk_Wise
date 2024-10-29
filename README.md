### Safety Risk Assessment App - React Native & Expo

This mobile application, built with React Native and Expo, is designed for conducting comprehensive safety risk assessments. The app provides a streamlined process for users to input activities, identify hazards, assess risks, and generate professional risk assessment reports in PDF format for on-device storage and sharing.

#### Key Features:

- **Tab Navigation**: 
   - Utilizes Expo Router with a tab bar featuring three screens: **Dashboard**, **Add Button**, and **Records**.
   - Dashboard is set as the initial screen upon app startup. Stack navigation is implemented for all tabs.

- **Input Flow for Risk Assessment**:
   - Centralized Add Button directs users to an input flow, enabling the addition of activities, hazards, risk assessments, and control measures.
   - Multiple screens guide users through the assessment process:
     1. **Activity Input** - Single work activity with options to capture images for each hazard.
     2. **Hazard Details** - Adds hazard effects and existing controls.
     3. **Risk Calculation** - Dropdowns for likelihood and severity input, with auto-calculated risk score.
     4. **Additional Controls** - Options to add control measures (AC, EC, PPE) and assign a point person.
     5. **Final Risk Assessment** - Reassess the hazard after controls are in place.

- **PDF Generation**: Compiles input data into a PDF saved locally in **Records** and accessible for online sharing.

#### Components:

- **Reusable Components**:
   - `Dropdown`: Simplifies input handling across screens for selecting hazards, likelihood, severity, and control measures.
   - `Navigation Buttons`: Continue and Back buttons streamline user navigation across input screens.
   
- **Records Storage**:
   - Stores completed PDF assessments locally with folders and files accessible for viewing, sharing, and organization.

The app features a **light theme** for a user-friendly experience. Further customization and modular component designs are in place to accommodate additional functionalities in future updates.
