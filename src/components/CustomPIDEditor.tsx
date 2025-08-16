
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Download, Upload, Save, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CustomPID {
  id: string;
  name: string;
  pid: string;
  unit: string;
  formula: string;
  minValue: number;
  maxValue: number;
  manufacturer: string;
  category: string;
  description: string;
  dataType: 'hex' | 'decimal' | 'binary';
  byteLength: number;
}

interface CustomPIDEditorProps {
  onPIDSave?: (pid: CustomPID) => void;
}

export const CustomPIDEditor: React.FC<CustomPIDEditorProps> = ({ onPIDSave }) => {
  const [customPIDs, setCustomPIDs] = useState<CustomPID[]>([]);
  const [currentPID, setCurrentPID] = useState<Partial<CustomPID>>({
    name: '',
    pid: '',
    unit: '',
    formula: '(A*256+B)/4',
    minValue: 0,
    maxValue: 100,
    manufacturer: '',
    category: 'engine',
    description: '',
    dataType: 'hex',
    byteLength: 2
  });
  const [editingIndex, setEditingIndex] = useState(-1);

  const manufacturers = ['Peugeot', 'BMW', 'VAG', 'Mercedes', 'Ford', 'Toyota', 'Generic'];
  const categories = ['engine', 'transmission', 'abs', 'airbag', 'climate', 'body', 'other'];

  const handleSavePID = () => {
    if (!currentPID.name || !currentPID.pid) {
      toast.error('Name and PID are required');
      return;
    }

    const newPID: CustomPID = {
      id: editingIndex >= 0 ? customPIDs[editingIndex].id : `custom_${Date.now()}`,
      name: currentPID.name!,
      pid: currentPID.pid!,
      unit: currentPID.unit || '',
      formula: currentPID.formula || '(A*256+B)/4',
      minValue: currentPID.minValue || 0,
      maxValue: currentPID.maxValue || 100,
      manufacturer: currentPID.manufacturer || 'Generic',
      category: currentPID.category || 'engine',
      description: currentPID.description || '',
      dataType: currentPID.dataType || 'hex',
      byteLength: currentPID.byteLength || 2
    };

    if (editingIndex >= 0) {
      const updated = [...customPIDs];
      updated[editingIndex] = newPID;
      setCustomPIDs(updated);
      toast.success('PID updated successfully');
    } else {
      setCustomPIDs([...customPIDs, newPID]);
      toast.success('PID added successfully');
    }

    onPIDSave?.(newPID);
    resetForm();
  };

  const handleEditPID = (index: number) => {
    setCurrentPID(customPIDs[index]);
    setEditingIndex(index);
  };

  const handleDeletePID = (index: number) => {
    const updated = customPIDs.filter((_, i) => i !== index);
    setCustomPIDs(updated);
    toast.success('PID deleted');
  };

  const resetForm = () => {
    setCurrentPID({
      name: '',
      pid: '',
      unit: '',
      formula: '(A*256+B)/4',
      minValue: 0,
      maxValue: 100,
      manufacturer: '',
      category: 'engine',
      description: '',
      dataType: 'hex',
      byteLength: 2
    });
    setEditingIndex(-1);
  };

  const exportPIDs = (format: 'json' | 'csv' | 'xml') => {
    if (customPIDs.length === 0) {
      toast.error('No PIDs to export');
      return;
    }

    let content = '';
    let filename = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(customPIDs, null, 2);
        filename = 'custom_pids.json';
        break;
      case 'csv':
        const headers = 'Name,PID,Unit,Formula,Min,Max,Manufacturer,Category,Description\n';
        const rows = customPIDs.map(pid => 
          `"${pid.name}","${pid.pid}","${pid.unit}","${pid.formula}",${pid.minValue},${pid.maxValue},"${pid.manufacturer}","${pid.category}","${pid.description}"`
        ).join('\n');
        content = headers + rows;
        filename = 'custom_pids.csv';
        break;
      case 'xml':
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<pids>\n${customPIDs.map(pid => 
          `  <pid>\n    <name>${pid.name}</name>\n    <id>${pid.pid}</id>\n    <unit>${pid.unit}</unit>\n    <formula>${pid.formula}</formula>\n    <min>${pid.minValue}</min>\n    <max>${pid.maxValue}</max>\n    <manufacturer>${pid.manufacturer}</manufacturer>\n    <category>${pid.category}</category>\n    <description>${pid.description}</description>\n  </pid>`
        ).join('\n')}\n</pids>`;
        filename = 'custom_pids.xml';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`PIDs exported as ${format.toUpperCase()}`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedPIDs: CustomPID[] = [];

        if (file.name.endsWith('.json')) {
          importedPIDs = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          importedPIDs = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',').map(v => v.replace(/"/g, ''));
            return {
              id: `imported_${Date.now()}_${index}`,
              name: values[0] || '',
              pid: values[1] || '',
              unit: values[2] || '',
              formula: values[3] || '(A*256+B)/4',
              minValue: parseFloat(values[4]) || 0,
              maxValue: parseFloat(values[5]) || 100,
              manufacturer: values[6] || 'Generic',
              category: values[7] || 'engine',
              description: values[8] || '',
              dataType: 'hex' as const,
              byteLength: 2
            };
          });
        }

        if (importedPIDs.length > 0) {
          setCustomPIDs([...customPIDs, ...importedPIDs]);
          toast.success(`Imported ${importedPIDs.length} PIDs`);
        }
      } catch (error) {
        toast.error('Failed to import PIDs');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Custom PID Editor
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">PID Editor</TabsTrigger>
          <TabsTrigger value="library">PID Library</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingIndex >= 0 ? 'Edit PID' : 'Add New PID'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pid-name">PID Name</Label>
                  <Input
                    id="pid-name"
                    value={currentPID.name || ''}
                    onChange={(e) => setCurrentPID({...currentPID, name: e.target.value})}
                    placeholder="e.g., Turbo Pressure"
                  />
                </div>
                <div>
                  <Label htmlFor="pid-code">PID Code</Label>
                  <Input
                    id="pid-code"
                    value={currentPID.pid || ''}
                    onChange={(e) => setCurrentPID({...currentPID, pid: e.target.value})}
                    placeholder="e.g., 221A"
                  />
                </div>
                <div>
                  <Label htmlFor="pid-unit">Unit</Label>
                  <Input
                    id="pid-unit"
                    value={currentPID.unit || ''}
                    onChange={(e) => setCurrentPID({...currentPID, unit: e.target.value})}
                    placeholder="e.g., bar, °C, %"
                  />
                </div>
                <div>
                  <Label htmlFor="pid-manufacturer">Manufacturer</Label>
                  <Select value={currentPID.manufacturer} onValueChange={(value) => setCurrentPID({...currentPID, manufacturer: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map(mfg => (
                        <SelectItem key={mfg} value={mfg}>{mfg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pid-category">Category</Label>
                  <Select value={currentPID.category} onValueChange={(value) => setCurrentPID({...currentPID, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pid-formula">Formula</Label>
                  <Input
                    id="pid-formula"
                    value={currentPID.formula || ''}
                    onChange={(e) => setCurrentPID({...currentPID, formula: e.target.value})}
                    placeholder="e.g., (A*256+B)/4"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pid-description">Description</Label>
                <Textarea
                  id="pid-description"
                  value={currentPID.description || ''}
                  onChange={(e) => setCurrentPID({...currentPID, description: e.target.value})}
                  placeholder="Detailed description of this PID..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSavePID} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingIndex >= 0 ? 'Update PID' : 'Add PID'}
                </Button>
                {editingIndex >= 0 && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom PID Library ({customPIDs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {customPIDs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No custom PIDs yet. Add some using the editor.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customPIDs.map((pid, index) => (
                      <div key={pid.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{pid.name}</h4>
                            <p className="text-sm text-muted-foreground">PID: {pid.pid}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{pid.manufacturer}</Badge>
                            <Badge variant="secondary">{pid.category}</Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{pid.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Unit: {pid.unit} | Formula: {pid.formula}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditPID(index)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePID(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import PIDs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import PIDs from JSON, CSV, or XML files (Torque/FORScan compatible)
                </p>
                <input
                  type="file"
                  accept=".json,.csv,.xml"
                  onChange={handleImport}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export PIDs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export your custom PIDs in various formats
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => exportPIDs('json')}>JSON</Button>
                  <Button size="sm" onClick={() => exportPIDs('csv')}>CSV</Button>
                  <Button size="sm" onClick={() => exportPIDs('xml')}>XML</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomPIDEditor;
