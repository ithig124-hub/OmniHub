import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, Clock, FileText, Map, BookOpen, Tag, Calendar, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import './search.css';

// Mock data for demonstration
const mockData = {
  notes: [
    { id: 'n1', title: 'Renaissance Architecture Study', content: 'Detailed notes on Brunelleschi\'s dome design and innovative construction techniques used in Florence Cathedral...', tags: ['architecture', 'history', 'renaissance'], date: '2024-01-15', linkedNotes: ['n3'] },
    { id: 'n2', title: 'Byzantine Empire Timeline', content: 'Chronological overview of key events from 330 CE to 1453 CE, including the reign of Justinian and the fall of Constantinople...', tags: ['history', 'byzantine', 'timeline'], date: '2024-01-12', linkedNotes: [] },
    { id: 'n3', title: 'Medieval Building Materials', content: 'Analysis of construction materials and methods in medieval Europe, focusing on stone masonry and timber framing...', tags: ['architecture', 'medieval', 'materials'], date: '2024-01-10', linkedNotes: ['n1'] },
    { id: 'n4', title: 'Greek Philosophy Overview', content: 'Comparative study of Plato and Aristotle\'s metaphysical frameworks and their influence on Western thought...', tags: ['philosophy', 'ancient-greece', 'metaphysics'], date: '2024-01-08', linkedNotes: [] },
    { id: 'n5', title: 'Roman Engineering Innovations', content: 'Examination of Roman concrete, aqueducts, and road building techniques that revolutionized infrastructure...', tags: ['engineering', 'rome', 'ancient'], date: '2024-01-05', linkedNotes: [] }
  ],
  maps: [
    { id: 'm1', name: 'Florence Cathedral', address: 'Piazza del Duomo, Florence, Italy', coords: '43.7731,11.2560', notes: 'Site of Renaissance architectural innovation' },
    { id: 'm2', name: 'Hagia Sophia', address: 'Sultanahmet, Istanbul, Turkey', coords: '41.0086,28.9802', notes: 'Byzantine architectural masterpiece' },
    { id: 'm3', name: 'Parthenon', address: 'Acropolis, Athens, Greece', coords: '37.9715,23.7267', notes: 'Classical Greek temple' },
    { id: 'm4', name: 'Colosseum', address: 'Piazza del Colosseo, Rome, Italy', coords: '41.8902,12.4922', notes: 'Roman amphitheater showcasing engineering prowess' },
    { id: 'm5', name: 'Pont du Gard', address: 'Vers-Pont-du-Gard, France', coords: '43.9475,4.5352', notes: 'Ancient Roman aqueduct bridge' }
  ],
  library: [
    { id: 'b1', title: 'The Architecture of the Italian Renaissance', author: 'Peter Murray', subject: 'Architecture', year: 1986, metadata: { publisher: 'Thames & Hudson', pages: 288 } },
    { id: 'b2', title: 'Byzantine Art and Architecture', author: 'John Lowden', subject: 'Art History', year: 1997, metadata: { publisher: 'Cambridge', pages: 240 } },
    { id: 'b3', title: 'A History of Western Philosophy', author: 'Bertrand Russell', subject: 'Philosophy', year: 1945, metadata: { publisher: 'Simon & Schuster', pages: 895 } },
    { id: 'b4', title: 'Roman Engineering', author: 'Kevin Greene', subject: 'Engineering', year: 2000, metadata: { publisher: 'University of California Press', pages: 192 } },
    { id: 'b5', title: 'The Greek World', author: 'Anton Powell', subject: 'Ancient History', year: 1995, metadata: { publisher: 'Routledge', pages: 672 } }
  ]
};

export const SearchModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Extract all available tags from notes
  const allTags = [...new Set(mockData.notes.flatMap(note => note.tags))];

  // Debounced search function
  const performSearch = useCallback((query, filter, tags) => {
    if (!query.trim() && tags.length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const searchResults = [];
      const lowerQuery = query.toLowerCase();
      const isPhrase = query.startsWith('"') && query.endsWith('"');
      const actualQuery = isPhrase ? query.slice(1, -1) : query;

      // Search notes
      if (filter === 'all' || filter === 'notes') {
        mockData.notes.forEach(note => {
          const matchesQuery = !query.trim() || 
            note.title.toLowerCase().includes(actualQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(actualQuery.toLowerCase());
          
          const matchesTags = tags.length === 0 || 
            tags.some(tag => note.tags.includes(tag));

          if (matchesQuery && matchesTags) {
            searchResults.push({
              type: 'note',
              id: note.id,
              title: note.title,
              preview: note.content.substring(0, 150) + '...',
              tags: note.tags,
              date: note.date,
              icon: FileText,
              matches: highlightMatches(note.title, actualQuery) || highlightMatches(note.content, actualQuery)
            });
          }
        });
      }

      // Search maps
      if (filter === 'all' || filter === 'maps') {
        mockData.maps.forEach(map => {
          if (query.trim() && (
            map.name.toLowerCase().includes(lowerQuery) ||
            map.address.toLowerCase().includes(lowerQuery) ||
            map.notes.toLowerCase().includes(lowerQuery)
          )) {
            searchResults.push({
              type: 'map',
              id: map.id,
              title: map.name,
              preview: map.address,
              subtitle: map.notes,
              icon: Map,
              coords: map.coords
            });
          }
        });
      }

      // Search library
      if (filter === 'all' || filter === 'library') {
        mockData.library.forEach(book => {
          if (query.trim() && (
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.subject.toLowerCase().includes(lowerQuery)
          )) {
            searchResults.push({
              type: 'library',
              id: book.id,
              title: book.title,
              preview: `by ${book.author}`,
              subtitle: `${book.subject} • ${book.year}`,
              icon: BookOpen,
              metadata: book.metadata
            });
          }
        });
      }

      setResults(searchResults);
      setIsSearching(false);
      
      // Add to search history
      if (query.trim()) {
        setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(h => h !== query)];
          return newHistory.slice(0, 5);
        });
      }
    }, 300);
  }, []);

  const highlightMatches = (text, query) => {
    if (!query) return null;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    return index !== -1 ? text.substring(Math.max(0, index - 20), Math.min(text.length, index + query.length + 20)) : null;
  };

  useEffect(() => {
    performSearch(searchQuery, activeFilter, selectedTags);
  }, [searchQuery, activeFilter, selectedTags, performSearch]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleResultClick = (result) => {
    console.log(`[MOCK NAVIGATION] Opening ${result.type} module with ID: ${result.id}`);
    console.log('Result details:', result);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setResults([]);
  };

  return (
    <div className={`search-module ${isDarkMode ? 'dark' : ''}`}>
      <div className="search-container">
        {/* Header */}
        <div className="search-header">
          <div className="header-content">
            <h1 className="search-title">Advanced Search</h1>
            <p className="search-subtitle">Discover connections across your knowledge base</p>
          </div>
          
          <div className="theme-toggle">
            <Label htmlFor="theme-mode" className="theme-label">Dark Mode</Label>
            <Switch 
              id="theme-mode"
              checked={isDarkMode} 
              onCheckedChange={setIsDarkMode}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder='Search across notes, maps, and library... (use "quotes" for exact phrases)'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="clear-button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="filter-toggle"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {/* Module Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="filter-tabs">
          <TabsList className="tabs-list">
            <TabsTrigger value="all" className="tab-trigger">All Modules</TabsTrigger>
            <TabsTrigger value="notes" className="tab-trigger">
              <FileText className="h-4 w-4 mr-1" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="maps" className="tab-trigger">
              <Map className="h-4 w-4 mr-1" />
              Maps
            </TabsTrigger>
            <TabsTrigger value="library" className="tab-trigger">
              <BookOpen className="h-4 w-4 mr-1" />
              Library
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Card className="advanced-filters">
            <CardContent className="filters-content">
              <div className="filter-section">
                <Label className="filter-label">
                  <Tag className="h-4 w-4" />
                  Filter by Tags
                </Label>
                <div className="tags-container">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="tag-badge"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && !searchQuery && (
          <div className="search-history">
            <Label className="history-label">
              <Clock className="h-4 w-4" />
              Recent Searches
            </Label>
            <div className="history-items">
              {searchHistory.map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery(query)}
                  className="history-item"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="results-container">
          {isSearching ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="results-header">
                <h3 className="results-count">{results.length} Results Found</h3>
              </div>
              <div className="results-grid">
                {results.map((result) => {
                  const IconComponent = result.icon;
                  return (
                    <Card 
                      key={result.id} 
                      className="result-card"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="result-content">
                        <div className="result-header">
                          <div className="result-icon">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <Badge variant="secondary" className="type-badge">
                            {result.type}
                          </Badge>
                        </div>
                        
                        <h4 className="result-title">{result.title}</h4>
                        <p className="result-preview">{result.preview}</p>
                        
                        {result.subtitle && (
                          <p className="result-subtitle">{result.subtitle}</p>
                        )}
                        
                        {result.tags && (
                          <div className="result-tags">
                            {result.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="result-tag">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {result.date && (
                          <div className="result-meta">
                            <Calendar className="h-3 w-3" />
                            <span>{result.date}</span>
                          </div>
                        )}
                        
                        {result.coords && (
                          <div className="result-meta">
                            <MapPin className="h-3 w-3" />
                            <span>{result.coords}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (searchQuery || selectedTags.length > 0) ? (
            <div className="empty-state">
              <Search className="empty-icon" />
              <h3 className="empty-title">No Results Found</h3>
              <p className="empty-description">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="empty-state">
              <Search className="empty-icon" />
              <h3 className="empty-title">Start Searching</h3>
              <p className="empty-description">
                Search across your notes, maps, and library to discover connections
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModule;