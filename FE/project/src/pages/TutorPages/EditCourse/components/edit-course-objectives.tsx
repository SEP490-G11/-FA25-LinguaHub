import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

export interface ObjectiveEditItem {
  id: number;
  objectiveText: string;
  orderIndex: number;
  isNew?: boolean;
}

interface EditCourseObjectivesProps {
  objectives: ObjectiveEditItem[];
  isLoading?: boolean;
}

export default function EditCourseObjectives({
  objectives: initialObjectives,
  isLoading = false,
}: EditCourseObjectivesProps) {
  const [objectivesList, setObjectivesList] = useState<ObjectiveEditItem[]>(
    initialObjectives || []
  );
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setObjectivesList(initialObjectives || []);
  }, [initialObjectives]);

  const handleAddObjective = () => {
    const error: Record<string, string> = {};

    if (!newObjectiveText.trim()) {
      error.objectiveText = 'Objective text is required';
    } else if (newObjectiveText.trim().length < 5) {
      error.objectiveText = 'Objective must be at least 5 characters';
    } else if (newObjectiveText.trim().length > 200) {
      error.objectiveText = 'Objective must not exceed 200 characters';
    }

    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }

    const newObjective: ObjectiveEditItem = {
      id: Math.min(...objectivesList.map(o => o.id), 0) - 1, // Temporary negative ID for new items
      objectiveText: newObjectiveText.trim(),
      orderIndex: objectivesList.length,
      isNew: true,
    };

    setObjectivesList([...objectivesList, newObjective]);
    setNewObjectiveText('');
    setErrors({});
  };

  const handleUpdateObjective = (index: number, text: string) => {
    const updated = [...objectivesList];
    updated[index].objectiveText = text;
    setObjectivesList(updated);
  };

  const handleRemoveObjective = (index: number) => {
    const updated = objectivesList.filter((_, i) => i !== index);
    // Update orderIndex for remaining items
    const reordered = updated.map((obj, i) => ({
      ...obj,
      orderIndex: i,
    }));
    setObjectivesList(reordered);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Course Objectives</h2>
        <p className="text-gray-600 mb-4">
          Manage learning objectives for this course. Students will see these goals
          before enrolling.
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 bg-gray-50">
        <div className="space-y-4">
          <div>
            <Label htmlFor="objective-input" className="text-base font-semibold mb-2">
              Add New Objective <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="objective-input"
                value={newObjectiveText}
                onChange={(e) => {
                  setNewObjectiveText(e.target.value);
                  if (errors.objectiveText) {
                    setErrors({});
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
                placeholder="e.g., Understand advanced grammar concepts"
                maxLength={200}
                disabled={isLoading}
                className={errors.objectiveText ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                onClick={handleAddObjective}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex justify-between mt-2">
              {errors.objectiveText && (
                <p className="text-red-500 text-sm">{errors.objectiveText}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {newObjectiveText.length}/200
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Objectives List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Objectives ({objectivesList.length})
        </h3>
        {objectivesList.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500">No objectives added yet</p>
            <p className="text-sm text-gray-400">Add your first objective above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {objectivesList.map((objective, index) => (
              <Card
                key={objective.id}
                className="p-4 flex items-start justify-between bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex-1 flex items-start gap-3">
                  <span className="font-semibold text-blue-600 min-w-fit pt-3">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <Input
                      value={objective.objectiveText}
                      onChange={(e) => handleUpdateObjective(index, e.target.value)}
                      disabled={isLoading}
                      className="text-gray-800"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {objective.objectiveText.length}/200
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(index)}
                  disabled={isLoading}
                  className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Remove objective"
                >
                  <X className="w-5 h-5" />
                </button>
              </Card>
            ))}
          </div>
        )}
        {errors.objectives && (
          <p className="text-red-500 text-sm mt-2">{errors.objectives}</p>
        )}
      </div>
    </div>
  );
}
