'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Input } from '@/components/core';
import { supabase, Note, Task, List, ListItem, Member, TEST_HOUSEHOLD_INVITE_CODE } from '@/lib/supabase';

// Simple bloom animation component
function Bloom({ open, color = 'var(--person-5)', size = 96 }: { open: boolean; color?: string; size?: number }) {
  if (!open) return null;
  
  const petals = [0, 60, 120, 180, 240, 300];
  
  return (
    <span style={{
      position: 'absolute',
      right: -30,
      top: '50%',
      transform: 'translateY(-50%)',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes bloom-petal {
          0% { transform: rotate(0deg) translateY(-20px); opacity: 0; }
          100% { transform: rotate(deg) translateY(-${size * 0.35}px); opacity: 1; }
        }
      `}</style>
      {petals.map((a) => (
        <span key={a} style={{
          position: 'absolute',
          width: size * 0.25,
          height: size * 0.25,
          background: color,
          borderRadius: '50%',
          transform: `rotate(${a}deg) translateY(-${size * 0.35}px)`,
          animation: `bloom-pop 0.5s ease-out forwards`,
          opacity: 0,
        }} />
      ))}
      <style>{`
        @keyframes bloom-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

export default function TodayScreen() {
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add item states
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddGrocery, setShowAddGrocery] = useState(false);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  
  // Bloom animation state
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: household } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', TEST_HOUSEHOLD_INVITE_CODE)
        .single();

      if (!household) {
        setLoading(false);
        return;
      }

      setHouseholdId(household.id);

      const [membersRes, notesRes, tasksRes, listsRes] = await Promise.all([
        supabase.from('members').select('*').eq('household_id', household.id),
        supabase.from('notes').select('*').eq('household_id', household.id).eq('pinned', true),
        supabase.from('tasks').select('*').eq('household_id', household.id),
        supabase.from('lists').select('*').eq('household_id', household.id),
      ]);

      setMembers(membersRes.data || []);
      setNotes(notesRes.data || []);
      setTasks(tasksRes.data || []);
      setLists(listsRes.data || []);

      if (listsRes.data && listsRes.data.length > 0) {
        const itemsRes = await supabase
          .from('list_items')
          .select('*')
          .eq('list_id', listsRes.data[0].id);
        setListItems(itemsRes.data || []);
      }

      setLoading(false);
    }

    loadData();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getMemberName = (id?: string) => {
    if (!id) return '';
    const member = members.find(m => m.id === id);
    return member?.name || '';
  };

  const getMemberColor = (id?: string) => {
    if (!id) return 'var(--person-1)';
    const member = members.find(m => m.id === id);
    return member?.color || 'var(--person-1)';
  };

  const toggleTask = async (id: string, completed: boolean) => {
    if (!completed) {
      setJustCompleted(id);
      setTimeout(() => setJustCompleted(null), 600);
    }
    await supabase.from('tasks').update({ completed: !completed }).eq('id', id);
  };

  const toggleListItem = async (id: string, checked: boolean) => {
    if (!checked) {
      setJustCompleted(id);
      setTimeout(() => setJustCompleted(null), 600);
    }
    await supabase.from('list_items').update({ checked: !checked }).eq('id', id);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !householdId) return;
    await supabase.from('tasks').insert({
      household_id: householdId,
      title: newTaskTitle,
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const addGrocery = async () => {
    if (!newGroceryItem.trim() || !lists[0]) return;
    await supabase.from('list_items').insert({
      list_id: lists[0].id,
      content: newGroceryItem,
    });
    setNewGroceryItem('');
    setShowAddGrocery(false);
  };

  const addNote = async () => {
    if (!newNoteContent.trim() || !householdId) return;
    await supabase.from('notes').update({ pinned: false }).eq('household_id', householdId).eq('pinned', true);
    await supabase.from('notes').insert({
      household_id: householdId,
      content: newNoteContent,
      pinned: true,
    });
    setNewNoteContent('');
    setShowAddNote(false);
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const groceryList = listItems;
  const pinnedNote = notes.find(n => n.pinned);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)' }}>Laster...</p>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? 'God morgen' : new Date().getHours() < 18 ? 'God ettermiddag' : 'God kveld';
  const today = new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-7)', height: '100%' }}>
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h1 style={{ font: 'var(--type-display)', color: 'var(--text-strong)', marginBottom: 'var(--space-1)' }}>
            {greeting}
          </h1>
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)' }}>
            {today} · Jakobsen-familien
          </p>
        </div>

        <Card>
          <h2 style={{ font: 'var(--type-subtitle)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="calendar-days" size={20} />
            I dag
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Koble til Google Kalender for å se hendelser</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ font: 'var(--type-subtitle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="check" size={20} />
              Oppgaver
            </h2>
            <Button tone="soft" size="sm" iconLeft={<Icon name="plus" size={16} />} onClick={() => setShowAddTask(!showAddTask)}>
              Legg til
            </Button>
          </div>

          {showAddTask && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Input
                placeholder="Hva trenger å gjøres?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                style={{ flex: 1 }}
              />
              <Button onClick={addTask}>Legg til</Button>
            </div>
          )}

          {incompleteTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {incompleteTasks.map(task => (
                <div key={task.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-xs)', border: '2px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    </span>
                    <span style={{ flex: 1, font: 'var(--type-body)' }}>{task.title}</span>
                    {task.assigned_to && (
                      <span style={{ font: 'var(--type-caption)', padding: 'var(--pad-chip)', background: `${getMemberColor(task.assigned_to)}22`, color: getMemberColor(task.assigned_to), borderRadius: 'var(--radius-pill)' }}>
                        {getMemberName(task.assigned_to)}
                      </span>
                    )}
                  </button>
                  {justCompleted === task.id && <Bloom open={true} size={60} />}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Alt ferdig. Det er hele listen.</p>
          )}
        </Card>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ font: 'var(--type-subtitle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="shopping-basket" size={20} />
              Handleliste
            </h2>
            <Button tone="ghost" size="sm" iconLeft={<Icon name="plus" size={16} />} onClick={() => setShowAddGrocery(!showAddGrocery)}>
            </Button>
          </div>

          {showAddGrocery && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Input
                placeholder="Legg til..."
                value={newGroceryItem}
                onChange={(e) => setNewGroceryItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGrocery()}
                style={{ flex: 1 }}
              />
              <Button onClick={addGrocery}>Legg til</Button>
            </div>
          )}

          {groceryList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {groceryList.map(item => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => toggleListItem(item.id, item.checked)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-xs)', border: item.checked ? 'none' : '2px solid var(--line-soft)', background: item.checked ? 'var(--ok)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.checked && <Icon name="check" size={14} style={{ color: 'white' }} />}
                    </span>
                    <span style={{ font: 'var(--type-body)', textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--text-faint)' : 'var(--text-body)' }}>
                      {item.content}
                    </span>
                  </button>
                  {justCompleted === item.id && <Bloom open={true} size={40} color="var(--ok)" />}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Ingenting på listen.</p>
          )}

          {groceryList.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: 'var(--border-hair)', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              {groceryList.filter(i => !i.checked).length} igjen
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ font: 'var(--type-subtitle)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="pin" size={20} />
            Festet
          </h2>

          {showAddNote && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Input
                placeholder="Skriv en notat..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <Button onClick={addNote}>Fest det</Button>
            </div>
          )}

          {pinnedNote ? (
            <div style={{ padding: 'var(--space-3)', background: 'var(--surface-sunk)', borderRadius: 'var(--radius-md)', font: 'var(--type-body)' }}>
              {pinnedNote.content}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Ingenting festet.</p>
          )}

          <Button tone="ghost" size="sm" iconLeft={<Icon name="plus" size={16} />} onClick={() => setShowAddNote(!showAddNote)} style={{ marginTop: 'var(--space-3)' }}>
            {showAddNote ? 'Avbryt' : 'Legg til notat'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
