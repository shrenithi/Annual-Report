import os
import zipfile

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        # Exclude heavy folders to keep the zip file compact
        if 'node_modules' in root or '.git' in root or '.agents' in root:
            continue
        for file in files:
            if file.endswith('.zip') or file == 'zip_project.py':
                continue
            filePath = os.path.join(root, file)
            relPath = os.path.relpath(filePath, path)
            ziph.write(filePath, relPath)

if __name__ == '__main__':
    zipf = zipfile.ZipFile('Annual_Report_Management_System.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('.', zipf)
    zipf.close()
    print("Successfully created Annual_Report_Management_System.zip")
