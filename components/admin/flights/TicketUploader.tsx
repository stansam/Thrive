import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Plus } from "lucide-react";

export function TicketUploader({ documents }: { documents: any[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ticket Management</CardTitle>
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Ticket
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{doc.filename}</p>
                                        <p className="text-xs text-muted-foreground">Version {doc.version} • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground bg-muted/20">
                        <Upload className="mx-auto h-8 w-8 mb-4 opacity-50" />
                        <p className="text-sm mb-2">Drag and drop ticket PDF here</p>
                        <Button variant="secondary" size="sm">Select File</Button>
                    </div>
                )}

                <div className="pt-4 border-t space-y-3">
                    <Label>Assign Ticket Numbers</Label>
                    <div className="flex gap-2">
                        <Input placeholder="e.g. 176-1234567890" />
                        <Button variant="outline">Save</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Adding ticket numbers will change status to TICKETED.</p>
                </div>
            </CardContent>
        </Card>
    );
}
