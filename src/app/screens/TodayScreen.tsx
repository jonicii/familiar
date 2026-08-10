'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon } from '@/components/core';
import { supabase, Note, Task, List, ListItem, Member, TEST_HOUSEHOLD_INVITE_CODE } from '@/lib/supabase';

export default function TodayScreen() {
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch household and data
  useEffect(() => {
    async function loadData() {
      // Get household by invite code
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

      // Fetch all data in parallel
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

      // Fetch list items for the first list (Groceries)
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

    // Subscribe to realtime changes
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadData(); // Reload on any change
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
    await supabase.from('tasks').update({ completed: !completed }).eq('id', id);
  };

  const toggleListItem = async (id: string, checked: boolean) => {
    await supabase.from('list_items').update({ checked: !checked }).eq('id', id);
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const groceryList = listItems;
  const pinnedNote = notes.find(n => n.pinned);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-7)', height: '100%' }}>
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Header */}
        <div>
          <h1 style={{ font: 'var(--type-display)', color: 'var(--text-strong)', marginBottom: 'var(--space-1)' }}>
            {greeting}
          </h1>
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)' }}>
            {today} · {members.length > 0 ? members[0].household_id ? 'The Jakobsens' : '' : ''}
          </p>
        </div>

        {/* Today's Events placeholder - will connect to Google Calendar */}
        <Card>
          <h2 style={{ font: 'var(--type-subtitle)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="calendar-days" size={20} />
            Today
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Connect Google Calendar to see events</p>
        </Card>

        {/* Tasks */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ font: 'var(--type-subtitle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="check" size={20} />
              Tasks
            </h2>
            <Button tone="soft" size="sm" iconLeft={<Icon name="plus" size={16} />}>
              Add
            </Button>
          </div>

          {incompleteTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {incompleteTasks.map(task => (
                <button
                  key={task.id}
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
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>All done. That is the whole list.</p>
          )}
        </Card>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Grocery List */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ font: 'var(--type-subtitle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="shopping-basket" size={20} />
              Groceries
            </h2>
            <Button tone="ghost" size="sm" iconLeft={<Icon name="plus" size={16} />}>
            </Button>
          </div>

          {groceryList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {groceryList.map(item => (
                <button
                  key={item.id}
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
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Nothing on the list.</p>
          )}

          {groceryList.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: 'var(--border-hair)', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              {groceryList.filter(i => !i.checked).length} left
            </div>
          )}
        </Card>

        {/* Pinned Notes */}
        <Card>
          <h2 style={{ font: 'var(--type-subtitle)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="pin" size={20} />
            Pinned
          </h2>

          {pinnedNote ? (
            <div style={{ padding: 'var(--space-3)', background: 'var(--surface-sunk)', borderRadius: 'var(--radius-md)', font: 'var(--type-body)' }}>
              {pinnedNote.content}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Nothing pinned.</p>
          )}

          <Button tone="ghost" size="sm" iconLeft={<Icon name="plus" size={16} />} style={{ marginTop: 'var(--space-3)' }}>
            Add note
          </Button>
        </Card>
      </div>
    </div>
  );
}
