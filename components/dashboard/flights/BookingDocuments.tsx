import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface Document {
    id: string;
    type: string;
    filename: string;
    version: number;
    uploaded_at: string;
    download_url: string;
}

interface BookingDocumentsProps {
    documents: Document[];
}

export function BookingDocuments({ documents }: BookingDocumentsProps) {
    if (!documents || documents.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Documents & Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground text-sm">
                        No documents available yet.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Documents & Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium text-sm">{doc.filename}</div>
                                <div className="text-xs text-muted-foreground">
                                    Ver. {doc.version} • {new Date(doc.uploaded_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={doc.download_url} download>
                                <Download className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
