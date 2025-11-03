import { useState } from 'react';
import { GripVertical, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionData } from '../types';

interface SectionListProps {
  sections: SectionData[];
  selectedSectionId: number | null;
  onSelectSection: (sectionId: number) => void;
  onAddSection: () => void;
  onEditSection: (section: SectionData) => void;
  onDeleteSection: (sectionId: number) => void;
  onReorderSections: (sections: SectionData[]) => void;
}

export function SectionList({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onEditSection,
  onDeleteSection,
}: SectionListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleExpand = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Course Sections</h2>
        <Button onClick={onAddSection} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No sections yet</p>
            <p className="text-sm mt-1">Add your first section to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.SectionID!);
              const isSelected = selectedSectionId === section.SectionID;
              const lessonCount = section.Lessons?.length || 0;

              return (
                <div
                  key={section.SectionID}
                  className={`rounded-lg border ${
                    isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'hover:bg-indigo-100' : ''
                    }`}
                    onClick={() => onSelectSection(section.SectionID!)}
                  >
                    <button
                      className="cursor-grab hover:text-indigo-600"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(section.SectionID!);
                      }}
                      className="hover:text-indigo-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{section.Title}</p>
                      <p className="text-xs text-gray-500">{lessonCount} lessons</p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSection(section);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSection(section.SectionID!);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && section.Lessons && section.Lessons.length > 0 && (
                    <div className="border-t bg-gray-50 px-3 py-2">
                      {section.Lessons.map((lesson, index) => (
                        <div
                          key={lesson.LessonID}
                          className="text-xs py-1.5 text-gray-700 flex items-center gap-2"
                        >
                          <span className="text-gray-400">{index + 1}.</span>
                          <span className="truncate">{lesson.Title}</span>
                          <span className="text-gray-400 ml-auto">
                            {lesson.Duration}min
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
