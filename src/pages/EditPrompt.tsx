import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Eye, History, ArrowLeftRight, PlayCircle, Share2, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { promptService } from '../services/promptService';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PromptVersion {
  id: string;
  content: {
    en: string;
    vi: string;
  };
  created_at: string;
}

interface EditablePrompt {
  id: string;
  title: string;
  description: string;
  content: {
    en: string;
    vi: string;
  };
  explanation: string;
  aiTool: string;
  purpose: string;
  tags: string[];
  settings: {
    allowFork: boolean;
    isPublic: boolean;
    allowComments: boolean;
    price: number;
  };
}

export function EditPrompt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [prompt, setPrompt] = useState<EditablePrompt | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<EditablePrompt | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadPrompt();
    loadVersions();
  }, [id]);

  const loadPrompt = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to edit prompts');
        navigate('/login', { state: { returnUrl: `/prompt/${id}/edit` } });
        return;
      }

      const promptData = await promptService.getPromptById(id!);
      if (promptData.author_id !== user.id) {
        toast.error('You can only edit your own prompts');
        navigate(`/prompt/${id}`);
        return;
      }
      // Đảm bảo tags luôn là mảng
      const safePromptData = {
        ...promptData,
        tags: promptData.tags || [],
      };
      setPrompt(safePromptData);
      setEditedPrompt(safePromptData);
    } catch (error) {
      console.error('Error loading prompt:', error);
      toast.error('Could not load prompt');
      navigate('/browse');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const { data: versions } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', id)
        .order('created_at', { ascending: false });

      setVersions(versions || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const validatePrompt = (): string[] => {
    const errors: string[] = [];
    if (!editedPrompt) return errors;

    if (!editedPrompt.title.trim()) {
      errors.push('Title is required');
    }

    if (!editedPrompt.content.en.trim()) {
      errors.push('English content is required');
    }

    if (!editedPrompt.aiTool) {
      errors.push('AI Tool selection is required');
    }

    if (!editedPrompt.purpose) {
      errors.push('Purpose is required');
    }

    if (editedPrompt.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    return errors;
  };

  const handleSave = async () => {
    if (!editedPrompt) return;

    const errors = validatePrompt();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setIsSaving(true);
      
      // Save current version to history
      await supabase
        .from('prompt_versions')
        .insert([{
          prompt_id: id,
          content: prompt?.content,
          created_at: new Date().toISOString()
        }]);

      // Update prompt
      const { error } = await supabase
        .from('prompts')
        .update({
          title: editedPrompt.title,
          description: editedPrompt.description,
          content: editedPrompt.content,
          explanation: editedPrompt.explanation,
          ai_tool: editedPrompt.aiTool,
          purpose: editedPrompt.purpose,
          settings: editedPrompt.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update tags
      await supabase
        .from('prompt_tags')
        .delete()
        .eq('prompt_id', id);

      await supabase
        .from('prompt_tags')
        .insert(
          editedPrompt.tags.map(tag => ({
            prompt_id: id,
            tag: tag.toLowerCase().trim()
          }))
        );

      toast.success('Prompt updated successfully');
      navigate(`/prompt/${id}`);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Could not save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertToVersion = async (versionId: string) => {
    try {
      const version = versions.find(v => v.id === versionId);
      if (!version || !editedPrompt) return;

      setEditedPrompt({
        ...editedPrompt,
        content: version.content
      });

      setShowVersions(false);
      setSelectedVersion(null);
      toast.success('Reverted to selected version');
    } catch (error) {
      console.error('Error reverting version:', error);
      toast.error('Could not revert to selected version');
    }
  };

  const handleTestPrompt = async () => {
    if (!editedPrompt) return;

    try {
      // Here you would integrate with the selected AI tool's API
      toast.success('Test functionality coming soon!');
    } catch (error) {
      console.error('Error testing prompt:', error);
      toast.error('Could not test prompt');
    }
  };

  if (isLoading || !editedPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Prompt
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowVersions(true)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <History className="h-5 w-5 mr-2" />
                Version History
              </button>
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                Compare Changes
              </button>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editedPrompt.title}
                onChange={(e) => setEditedPrompt({
                  ...editedPrompt,
                  title: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editedPrompt.description}
                onChange={(e) => setEditedPrompt({
                  ...editedPrompt,
                  description: e.target.value
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Content
              </label>
              <textarea
                value={editedPrompt.content.en}
                onChange={(e) => setEditedPrompt({
                  ...editedPrompt,
                  content: {
                    ...editedPrompt.content,
                    en: e.target.value
                  }
                })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                placeholder="Enter the prompt content in English..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vietnamese Content (Optional)
              </label>
              <textarea
                value={editedPrompt.content.vi}
                onChange={(e) => setEditedPrompt({
                  ...editedPrompt,
                  content: {
                    ...editedPrompt.content,
                    vi: e.target.value
                  }
                })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                placeholder="Enter the prompt content in Vietnamese..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation
              </label>
              <textarea
                value={editedPrompt.explanation}
                onChange={(e) => setEditedPrompt({
                  ...editedPrompt,
                  explanation: e.target.value
                })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Explain how to use this prompt effectively..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Tool
                </label>
                <select
                  value={editedPrompt.aiTool}
                  onChange={(e) => setEditedPrompt({
                    ...editedPrompt,
                    aiTool: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select AI Tool</option>
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Gemini">Gemini</option>
                  <option value="Claude">Claude</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  value={editedPrompt.purpose}
                  onChange={(e) => setEditedPrompt({
                    ...editedPrompt,
                    purpose: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Purpose</option>
                  <option value="Writing">Writing</option>
                  <option value="Research">Research</option>
                  <option value="Programming">Programming</option>
                  <option value="Image">Image Generation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={editedPrompt.tags?.join(', ') || ''} // Thêm kiểm tra an toàn
                onChange={(e) => setEditedPrompt({
                  ...editedPrompt,
                  tags: e.target.value.split(',').map(tag => tag.trim())
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter tags separated by commas..."
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedPrompt.settings.allowFork}
                  onChange={(e) => setEditedPrompt({
                    ...editedPrompt,
                    settings: {
                      ...editedPrompt.settings,
                      allowFork: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Allow forking</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedPrompt.settings.isPublic}
                  onChange={(e) => setEditedPrompt({
                    ...editedPrompt,
                    settings: {
                      ...editedPrompt.settings,
                      isPublic: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Make public</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedPrompt.settings.allowComments}
                  onChange={(e) => setEditedPrompt({
                    ...editedPrompt,
                    settings: {
                      ...editedPrompt.settings,
                      allowComments: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Allow comments</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (points)
                </label>
                <input
                  type="number"
                  value={editedPrompt.settings.price}
                  onChange={(e) => setEditedPrompt({
                    ...editedPrompt,
                    settings: {
                      ...editedPrompt.settings,
                      price: parseInt(e.target.value) || 0
                    }
                  })}
                  min="0"
                  className="w-40 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </button>
            <button
              onClick={handleTestPrompt}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Test
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => navigate(`/prompt/${id}`)}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Version History Modal */}
        {showVersions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Version History</h2>
              <div className="max-h-96 overflow-y-auto">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border-b py-4 last:border-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRevertToVersion(version.id)}
                        className="text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        Revert to this version
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                      {version.content.en}
                    </pre>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVersions(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{editedPrompt.title}</h3>
                <p className="text-gray-600">{editedPrompt.description}</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {editedPrompt.content.en}
                  </pre>
                </div>
                {editedPrompt.content.vi && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {editedPrompt.content.vi}
                    </pre>
                  </div>
                )}
                <p className="text-gray-600">{editedPrompt.explanation}</p>
                <div className="flex flex-wrap gap-2">
                  {editedPrompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Compare Changes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Original Version</h3>
                  <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                    {prompt?.content.en}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Edited Version</h3>
                  <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                    {editedPrompt.content.en}
                  </pre>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}