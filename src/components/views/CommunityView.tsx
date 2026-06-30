import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ShieldAlert, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  // Post states
  const [posts, setPosts] = useState<any[]>([
    {
      id: 'p1',
      title: 'Tips for safety during late-night commutes?',
      content: 'I frequently travel back from work around 10 PM on public transport. Does anyone have specific route recommendations or safety tips?',
      category: 'Safety',
      isAnonymous: true,
      createdAt: '2026-06-25T18:00:00Z',
    },
    {
      id: 'p2',
      title: 'Ob-Gyn recommendations in the Bay Area?',
      content: 'Looking for a certified provider with experience in PCOS treatments. Appreciate any leads.',
      category: 'Health',
      isAnonymous: false,
      createdAt: '2026-06-25T12:00:00Z',
    }
  ]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Safety');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Generate idempotency UUID
  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': generateUuid(),
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          isAnonymous,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || 'Failed to publish post.');
      } else {
        setSuccessMessage('Post published successfully!');
        // Add new post locally to top of list
        const addedPost = {
          id: result.data.postId,
          title: newTitle,
          content: newContent,
          category: newCategory,
          isAnonymous,
          createdAt: new Date().toISOString(),
        };
        setPosts(prev => [addedPost, ...prev]);
        
        // Reset form
        setNewTitle('');
        setNewContent('');
        setIsAnonymous(false);
      }
    } catch (err) {
      setErrorMessage('Network error publishing post.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = activeCategoryFilter === 'All'
    ? posts
    : posts.filter(p => p.category.toLowerCase() === activeCategoryFilter.toLowerCase());

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary">Community Forums</h1>
        <p className="text-text-secondary text-sm">Join anonymous peer networks and exchange safety & wellness tips.</p>
      </div>

      {successMessage && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 text-xs bg-state-error/10 border border-state-error/20 text-state-error rounded-xl text-center font-semibold flex items-center justify-center gap-1.5">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Post Card */}
        <Card className="lg:col-span-1 border-primary-lavender/30 self-start">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-violet" />
              <span>Create New Thread</span>
            </CardTitle>
            <CardDescription className="text-xs">Posts are monitored by pre-save AI moderators.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Input
                label="Topic Title"
                placeholder="Tips for solo travel?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase block mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                >
                  <option value="Safety">Safety</option>
                  <option value="Health">Health</option>
                  <option value="Career">Career</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase block">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Share details here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none resize-none"
                  required
                />
              </div>

              <div className="py-2 border-y border-bg-border/60">
                <Switch
                  label="Publish Anonymously"
                  description="Keeps your name and avatar private on feed grids."
                  checked={isAnonymous}
                  onChange={setIsAnonymous}
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-primary-violet hover:bg-primary-dark"
              >
                Publish Thread
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Forums Feed Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-bg-border/60 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-violet" />
                  <span>Discussion Streams</span>
                </CardTitle>
                <CardDescription className="text-xs">Browse latest questions from SheNova users.</CardDescription>
              </div>
              
              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Safety', 'Health', 'Career', 'Wellness'].map((cat) => {
                  const isActive = activeCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold font-inter transition-all duration-150 border
                        ${isActive
                          ? 'bg-primary-violet border-primary-violet text-white'
                          : 'bg-white border-bg-border text-text-secondary hover:border-primary-violet/30'
                        }
                      `}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="divide-y divide-bg-border/60 p-0">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="p-5 space-y-3 hover:bg-bg-surface/30 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-sm font-bold text-text-primary font-poppins">{post.title}</h3>
                    <Badge variant={post.category === 'Safety' ? 'error' : post.category === 'Health' ? 'blush' : 'primary'}>
                      {post.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed font-inter">{post.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary pt-2">
                    <span className="font-semibold flex items-center gap-1">
                      {post.isAnonymous ? (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5 text-primary-violet" />
                          <span>Anonymous Poster</span>
                        </>
                      ) : (
                        <span>Jane Doe</span>
                      )}
                    </span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <MessageCircle className="h-8 w-8 text-text-secondary opacity-30" />
                <p className="text-xs text-text-secondary">No threads logged in this category stream.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default CommunityView;
