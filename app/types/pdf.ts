
export interface Assessment {
    id: string;
    name: string;
    date: string;
    activity: string;
    hazards: any[];
    folderId: string;
    pdfPath?: string;
  }

  export interface Folder {
    id: string;
    name: string;
  }