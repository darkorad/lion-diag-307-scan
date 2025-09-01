
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Database
} from 'lucide-react';
import { ObdPid, getStoredPids, saveCustomPids, resetToDefaultPids } from '@/obd2/psa-pids';
import { useObdPidFetcher, PidTestResult } from '@/obd2/useObdPidFetcher';
import { toast } from 'sonner';

const AdvancedUserPidTable: React.FC = () => {
  const [pids, setPids] = useState<ObdPid[]>([]);
  const [editingPid, setEditingPid] = useState<ObdPid | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: PidTestResult}>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const { loading, result, error, fetchPid } = useObdPidFetcher();

  useEffect(() => {
    const storedPids = getStoredPids();
    setPids(storedPids);
  }, []);

  const savePids = (newPids: ObdPid[]) => {
    setPids(newPids);
    saveCustomPids(newPids);
    toast.success('PIDs saved successfully');
  };

  const handleTestPid = async (pid: ObdPid) => {
    try {
      await fetchPid(pid);
      if (result) {
        const pidKey = `${pid.mode}${pid.pid}`;
        setTestResults(prev => ({
          ...prev,
          [pidKey]: result
        }));
        toast.success(`PID ${pid.name} tested successfully`);
      }
    } catch (err) {
      toast.error(`Failed to test PID ${pid.name}: ${error}`);
    }
  };

  const handleAddPid = () => {
    const newPid: ObdPid = {
      name: '',
      mode: '01',
      pid: '',
      formula: 'A',
      unit: '',
      description: '',
      category: 'standard'
    };
    setEditingPid(newPid);
    setIsEditDialogOpen(true);
  };

  const handleEditPid = (pid: ObdPid) => {
    setEditingPid({ ...pid });
    setIsEditDialogOpen(true);
  };

  const handleSavePid = () => {
    if (!editingPid) return;

    const isNew = !pids.find(p => p.mode === editingPid.mode && p.pid === editingPid.pid);
    
    if (isNew) {
      savePids([...pids, editingPid]);
    } else {
      const updatedPids = pids.map(p => 
        p.mode === editingPid.mode && p.pid === editingPid.pid ? editingPid : p
      );
      savePids(updatedPids);
    }

    setIsEditDialogOpen(false);
    setEditingPid(null);
  };

  const handleDeletePid = (pid: ObdPid) => {
    const updatedPids = pids.filter(p => !(p.mode === pid.mode && p.pid === pid.pid));
    savePids(updatedPids);
    toast.success(`Deleted PID: ${pid.name}`);
  };

  const handleResetToDefaults = () => {
    const defaultPids = resetToDefaultPids();
    setPids(defaultPids);
    setTestResults({});
    toast.success('Reset to default PIDs');
  };

  const categories = ['all', 'standard', 'engine', 'dpf', 'turbo', 'egr', 'fuel', 'emission'];
  const filteredPids = activeCategory === 'all' 
    ? pids 
    : pids.filter(pid => pid.category === activeCategory);

  const getPidKey = (pid: ObdPid) => `${pid.mode}${pid.pid}`;
  const getTestResult = (pid: ObdPid) => testResults[getPidKey(pid)];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <span>Advanced PID Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label>Filter by Category</Label>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPid} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add PID</span>
              </Button>
              <Button onClick={handleResetToDefaults} variant="outline" className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mode/PID</TableHead>
                  <TableHead>Formula</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPids.map((pid) => {
                  const testResult = getTestResult(pid);
                  return (
                    <TableRow key={getPidKey(pid)}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pid.name}</div>
                          <div className="text-sm text-muted-foreground">{pid.description}</div>
                          {pid.category && (
                            <Badge variant="secondary" className="mt-1">
                              {pid.category}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {pid.mode} {pid.pid}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{pid.formula}</div>
                      </TableCell>
                      <TableCell>{pid.unit}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleTestPid(pid)}
                            disabled={loading}
                            className="flex items-center space-x-1"
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            <span>Test</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPid(pid)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePid(pid)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {testResult && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <div className="font-semibold">Result: {testResult.value} {pid.unit}</div>
                            <div>Raw: {testResult.raw}</div>
                            {testResult.error && (
                              <div className="text-red-600">Error: {testResult.error}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPid && pids.find(p => p.mode === editingPid.mode && p.pid === editingPid.pid) 
                ? 'Edit PID' : 'Add New PID'}
            </DialogTitle>
          </DialogHeader>
          {editingPid && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingPid.name}
                  onChange={(e) => setEditingPid({...editingPid, name: e.target.value})}
                  placeholder="e.g., Engine RPM"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mode</Label>
                  <Select
                    value={editingPid.mode}
                    onValueChange={(value) => setEditingPid({...editingPid, mode: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01 (Standard)</SelectItem>
                      <SelectItem value="22">22 (Manufacturer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>PID</Label>
                  <Input
                    value={editingPid.pid}
                    onChange={(e) => setEditingPid({...editingPid, pid: e.target.value.toUpperCase()})}
                    placeholder="e.g., 0C"
                  />
                </div>
              </div>
              <div>
                <Label>Formula</Label>
                <Input
                  value={editingPid.formula}
                  onChange={(e) => setEditingPid({...editingPid, formula: e.target.value})}
                  placeholder="e.g., (A*256+B)/4"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={editingPid.unit}
                  onChange={(e) => setEditingPid({...editingPid, unit: e.target.value})}
                  placeholder="e.g., rpm"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={editingPid.description}
                  onChange={(e) => setEditingPid({...editingPid, description: e.target.value})}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={editingPid.category || 'standard'}
                  onValueChange={(value) => setEditingPid({...editingPid, category: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="dpf">DPF</SelectItem>
                    <SelectItem value="turbo">Turbo</SelectItem>
                    <SelectItem value="egr">EGR</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="emission">Emission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSavePid} className="flex-1">
                  Save PID
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedUserPidTable;
