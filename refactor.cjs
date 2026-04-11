const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const getFiles = (dir, files = []) => {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files);
        } else {
            if (name.endsWith('.jsx') || name.endsWith('.js')) {
                files.push(name);
            }
        }
    }
    return files;
};

const allFiles = getFiles(srcDir);

let counts = {
    localhost: 0,
    aiges: 0,
    alerts: 0
};

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Replace http://localhost:5000 with environment variable template safely
    // Match 'http://localhost:5000/something' -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/something`
    const localhostRegex1 = /'http:\/\/localhost:5000([^']*)'/g;
    if (localhostRegex1.test(content)) {
        content = content.replace(localhostRegex1, "`\\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}$1`");
        counts.localhost++;
    }
    
    // For double quotes
    const localhostRegex2 = /"http:\/\/localhost:5000([^"]*)"/g;
    if (localhostRegex2.test(content)) {
        content = content.replace(localhostRegex2, "`\\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}$1`");
        counts.localhost++;
    }

    // 2. Replace "aiges ai" -> "Med_Intel AI"
    const aigesRegex = /aiges\s*ai/gi;
    if (aigesRegex.test(content)) {
        content = content.replace(aigesRegex, "Med_Intel AI");
        counts.aiges++;
    }

    // Replace "Aiges" -> "Med_Intel"
    const aigesWordRegex = /\baiges\b/gi;
    if (aigesWordRegex.test(content)) {
        content = content.replace(aigesWordRegex, "Med_Intel");
        counts.aiges++;
    }

    // 3. Inject CustomAlert imports if not already there, and replace native alerts
    const filesNeedingAlerts = ['DashboardLayout.jsx', 'MedicalReports.jsx', 'MedicalHistory.jsx', 'ProfileSettings.jsx', 'LoginPage.jsx', 'SignupPage.jsx'];
    const fileName = path.basename(file);
    
    if (filesNeedingAlerts.includes(fileName)) {
        if (!content.includes('import { customAlert')) {
            // Find last import
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfImport = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfImport + 1) + "import { customAlert, customPrompt, customConfirm } from '../utils/CustomAlert';\n" + content.slice(endOfImport + 1);
            }
        }

        // Custom replacements mapping for technical jargon
        const alertPolishes = [
            [/alert\("Action Locked: Please strictly complete and 'Save' your Profile details first to access this dashboard feature."\);/g, 'customAlert("Please complete your profile details before accessing this feature.", "error");'],
            [/alert\("Action Locked: Please strictly complete and 'Save' your Profile details first before uploading reports."\);/g, 'customAlert("Please complete your profile details before uploading reports.", "error");'],
            [/return alert\("Upload blocked: Only pure PDF files and Images \(JPG, PNG\) are supported by the AI pipeline."\);/g, 'return customAlert("Please upload your document as a PDF or image file (JPG, PNG).", "error");'],
            [/prompt\("Enter a clinical title for this document \(e\.g\. Brain MRI, CBC Panel\):"\)/g, 'await customPrompt("Please enter a title for this clinical document (e.g. Brain MRI):")'],
            [/alert\(`Upload Interrupted: \$\{error.message\}`\);/g, 'customAlert("We encountered an issue uploading your file. Please try again.", "error");'],
            
            // Medical Reports
            [/alert\("Only PDF or Images \(JPG, PNG\) supported by the OCR pipeline."\);/g, 'customAlert("Please upload your document as a PDF or image file (JPG, PNG).", "error");'],
            [/prompt\("Enter clinical title for the document \(e\.g\. CBC Panel, MRI\):"\)/g, 'await customPrompt("Please enter a title for this clinical document:")'],
            [/alert\("Failed bridging the file cleanly\. Reverting\.\.\."\);/g, 'customAlert("We encountered an error processing your file. Please try submitting again.", "error");'],
            [/alert\("Doctor direct-sharing link copied securely to your clipboard!"\);/g, 'customAlert("Link copied to clipboard successfully!");'],
            [/return alert\("No reports available to download\."\)/g, 'return customAlert("No records available to download.", "error")'],
            [/window\.confirm\("Security Action: Are you sure you want to completely erase this clinical record\?"\)/g, 'await customConfirm("Are you sure you want to permanently delete this clinical record?")'],
            [/alert\(err.message\)/g, 'customAlert("An action could not be completed at this time.", "error")'],
            [/alert\("Multi-page upload queue trigger"\)/g, 'customAlert("Multi-page upload will be supported in a future update.")'],

            // Medical History
            [/const handleDownloadAll = \(\) => {/g, 'const handleDownloadAll = async () => {'],
            [/prompt\("Enter a new title for this report:", currentTitle\)/g, 'await customPrompt("Enter a new title for this report:", currentTitle)'],
            [/window\.confirm\("Security Action: Are you sure you want to completely erase this clinical record from your UI and safely destroy the referenced file globally from Cloudinary Storage\?"\)/g, 'await customConfirm("Are you sure you want to permanently delete this clinical record?")'],
            [/return alert\("No active reports to download\."\)/g, 'return customAlert("No records available to download.", "error")'],
            [/window\.confirm\(`Are you sure you want to download \$\{reports\.length\} reports\? \(Check browser popup permissions\)`\)/g, 'await customConfirm(`Are you sure you want to download ${reports.length} reports? (Ensure popups are allowed)`)'],

            // Profile Settings
            [/alert\("Authentication Error: Account Identity not found\. Please log in again\."\)/g, 'customAlert("Your session has expired. Please log in again.", "error")'],
            [/alert\("New Passwords do not match!"\)/g, 'customAlert("The new passwords you entered do not match.", "error")'],
            [/alert\("Medical profile locked and saved securely to Cloud!"\)/g, 'customAlert("Profile saved successfully!")'],
            [/alert\("Failed to save: " \+ updatedData\.message\)/g, 'customAlert("Unable to save profile changes.", "error")'],
            [/alert\("Error securely synchronizing data to the Database\."\)/g, 'customAlert("We could not save your profile. Please try again.", "error")'],
            [/alert\("Please fill all password fields\."\)/g, 'customAlert("Please fill all password fields.", "error")'],
            [/alert\("Failed to change password: " \+ updatedData\.message\)/g, 'customAlert("Unable to update password.", "error")'],
            [/alert\("Error changing password\."\)/g, 'customAlert("Unable to update password.", "error")'],
            [/alert\("Account and all associated medical data securely deleted\."\)/g, 'customAlert("Your account has been deleted successfully.")'],
            [/alert\("Failed to delete account: " \+ data\.message\)/g, 'customAlert("Unable to delete account.", "error")'],
            [/alert\("Error contacting server to delete account\."\)/g, 'customAlert("Unable to delete account.", "error")'],
            [/alert\('Profile photo updated successfully!'\)/g, 'customAlert("Profile photo updated successfully!")'],
            [/alert\('Upload failed: ' \+ data\.message\)/g, 'customAlert("We encountered an issue uploading your photo.", "error")'],
            [/alert\('Error connecting to backend API\.'\)/g, 'customAlert("Please check your connection and try again.", "error")'],
        ];

        alertPolishes.forEach(([regex, replacement]) => {
            if (regex.test(content)) {
                content = content.replace(regex, replacement);
                counts.alerts++;
            }
        });
        
        // Catch-all remaining alerts cleanly just in case
        const remainingAlerts = /alert\((.*?)\)/g;
        if (remainingAlerts.test(content)) {
            content = content.replace(remainingAlerts, "customAlert($1, 'error')");
            counts.alerts++;
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log("Refactoring complete:", counts);
