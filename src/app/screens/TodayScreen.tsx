'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Input } from '@/components/core';
import { supabase, Note, Task, List, ListItem, Member, TEST_HOUSEHOLD_INVITE_CODE, signInWithGoogle } from '@/lib/supabase';

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

export default function TodayScreen({ isMobile = false }: { isMobile?: boolean }) {
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<{id: string; title: string; start: string; end: string; allDay?: boolean}[]>([]);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string>('primary');
  const [loading, setLoading] = useState(true);
  
  // Add event modal
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [addEventLoading, setAddEventLoading] = useState(false);
  const [addEventError, setAddEventError] = useState<string | null>(null);

  // Edit event modal
  const [editingEvent, setEditingEvent] = useState<{id: string; title: string; start: string; end?: string} | null>(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventEndTime, setEditEventEndTime] = useState('');
  const [editEventLoading, setEditEventLoading] = useState(false);
  const [editEventError, setEditEventError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Add item states
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddGrocery, setShowAddGrocery] = useState(false);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [showDoneItems, setShowDoneItems] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  
  // Bloom animation state
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  // Convert UTC ISO timestamp to Oslo HH:MM time
  const toOsloTime = (isoString: string) => {
    const utcDate = new Date(isoString);
    const osloDate = new Date(utcDate.getTime() + 2 * 60 * 60 * 1000);
    return osloDate.toISOString().slice(11, 16);
  };

  // Extract calendar fetch so it can be called after creating events
  const fetchCalendarEvents = async (calId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        const calRes = await fetch(`/api/calendar?weeks=4${calId !== 'primary' ? `&calendarId=${encodeURIComponent(calId)}` : ''}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'x-google-token': session.provider_token || '',
          }
        });
        const calData = await calRes.json();
        if (calRes.ok) {
          setCalendarEvents(calData.events || []);
        } else {
          setCalendarError(calData.message || calData.error || `Kalenderfeil`);
        }
      } else {
        setCalendarError('Ingen Google-tilgang — logg ut og inn igjen');
      }
    } catch (e) {
      console.error('Failed to fetch calendar:', e);
      setCalendarError('Klarte ikke å koble til kalender');
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data: household } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', TEST_HOUSEHOLD_INVITE_CODE)
        .single();

      const householdCalendarId = household?.google_calendar_id || 'primary';
      setCalendarId(householdCalendarId);

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

      await fetchCalendarEvents(householdCalendarId);
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

  const openEditModal = (event: {id: string; title: string; start: string; end?: string; allDay?: boolean}) => {
    setEditingEvent(event);
    setEditEventTitle(event.title);
    let date: string;
    let time: string;
    if (event.allDay || !event.start.includes('T')) {
      date = event.start.slice(0, 10);
      time = '';
    } else {
      // Convert UTC to Oslo for display
      const osloDate = new Date(new Date(event.start).getTime() + 2 * 60 * 60 * 1000);
      date = osloDate.toISOString().slice(0, 10);
      time = osloDate.toISOString().slice(11, 16);
    }
    let endTime = '';
    if (event.end && event.end.includes('T')) {
      const endOslo = new Date(new Date(event.end).getTime() + 2 * 60 * 60 * 1000);
      endTime = endOslo.toISOString().slice(11, 16);
    }
    setEditEventDate(date);
    setEditEventTime(time);
    setEditEventEndTime(endTime);
    setEditEventError(null);
    setConfirmDelete(false);
  };

  const saveEditedEvent = async () => {
    if (!editingEvent || !editEventTitle.trim()) return;
    setEditEventLoading(true);
    setEditEventError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        setEditEventError('Ingen Google-tilgang');
        setEditEventLoading(false);
        return;
      }

      const start = editEventTime ? `${editEventDate}T${editEventTime}:00` : editEventDate;
      const end = editEventTime && editEventEndTime ? `${editEventDate}T${editEventEndTime}:00` : undefined;

      const res = await fetch(`/api/calendar/${editingEvent.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-google-token': session.provider_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: editEventTitle, start, end, calendarId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setEditEventError(data.message || 'Kunne ikke lagre');
        setEditEventLoading(false);
        return;
      }

      setEditingEvent(null);
      setEditEventLoading(false);
      await fetchCalendarEvents(calendarId);
    } catch (e) {
      setEditEventError('Noe gikk galt');
      setEditEventLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!editingEvent) return;
    setEditEventLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) return;

      const res = await fetch(`/api/calendar/${editingEvent.id}?calendarId=${encodeURIComponent(calendarId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-google-token': session.provider_token,
        },
      });

      if (res.ok || res.status === 204) {
        setEditingEvent(null);
        setEditEventLoading(false);
        await fetchCalendarEvents(calendarId);
      }
    } catch (e) {
      setEditEventLoading(false);
    }
  };

  const addCalendarEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    setAddEventLoading(true);
    setAddEventError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        setAddEventError('Ingen Google-tilgang');
        setAddEventLoading(false);
        return;
      }

      const start = newEventTime ? `${newEventDate}T${newEventTime}:00` : newEventDate;
      const end = newEventTime && newEventEndTime ? `${newEventDate}T${newEventEndTime}:00` : undefined;

      const res = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-google-token': session.provider_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: newEventTitle, start, end, calendarId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAddEventError(
          (data.message || `Feil (${res.status})`) +
          (data.payloadSent ? `\nPayload: ${JSON.stringify(data.payloadSent)}` : '') +
          (data.input ? `\nInput: ${JSON.stringify(data.input)}` : '')
        );
        setAddEventLoading(false);
        return;
      }

      setNewEventTitle('');
      setNewEventDate('');
      setNewEventTime('');
      setNewEventEndTime('');
      setShowAddEvent(false);
      setAddEventLoading(false);
      await fetchCalendarEvents(calendarId); // Refresh events
    } catch (e) {
      setAddEventError('Noe gikk galt');
      setAddEventLoading(false);
    }
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
    <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 'var(--space-4)' : 'var(--space-7)', height: '100%' }}>
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

        {/* Week calendar card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ font: 'var(--type-subtitle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="calendar-days" size={20} />
              Ukalender
            </h2>
            {!calendarError && (
              <Button tone="soft" size="sm" iconLeft={<Icon name="plus" size={14} />} onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setNewEventDate(today);
                setShowAddEvent(true);
              }}>
                Legg til
              </Button>
            )}
          </div>

          {calendarError ? (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)', font: 'var(--type-caption)' }}>
                {calendarError}
              </p>
              <Button tone="soft" size="sm" onClick={() => signInWithGoogle()}>
                <Icon name="calendar-month" size={14} />
                {' '}Koble til
              </Button>
            </div>
          ) : (
            (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const todayStr = today.toISOString().slice(0, 10);
              const dayOfWeek = today.getDay();
              const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              const monday = new Date(today);
              monday.setDate(today.getDate() - daysFromMonday);

              const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
              const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

              const getEventsForDay = (date: Date) => {
                const dateStr = date.toISOString().slice(0, 10);
                return calendarEvents.filter(e => {
                  if (e.allDay || !e.start?.includes('T')) {
                    // All-day: compare UTC date strings directly
                    return e.start?.slice(0, 10) === dateStr;
                  } else {
                    // Timed event: convert to Oslo date for correct day display
                    // e.g. "2026-08-14T06:00:00.000Z" (UTC) → "2026-08-14" (Oslo, UTC+2)
                    const utcDate = new Date(e.start);
                    const osloDate = new Date(utcDate.getTime() + 2 * 60 * 60 * 1000);
                    return osloDate.toISOString().slice(0, 10) === dateStr;
                  }
                });
              };

              // Desktop: horizontal 7-day grid
              if (!isMobile) {
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-3)' }}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const day = new Date(monday);
                      day.setDate(monday.getDate() + i);
                      const dayStr = day.toISOString().slice(0, 10);
                      const isToday = dayStr === todayStr;
                      const events = getEventsForDay(day);
                      return (
                        <div key={dayStr} style={{
                          borderRadius: 'var(--radius-md)',
                          background: isToday ? 'var(--accent-soft)' : 'var(--surface-sunk)',
                          padding: 'var(--space-3)',
                          minHeight: '100px',
                        }}>
                          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
                            <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', fontSize: '10px' }}>
                              {weekDays[i]}
                            </div>
                            <div style={{
                              font: 'var(--type-numeral)',
                              fontSize: '16px',
                              color: isToday ? 'var(--accent)' : 'var(--text-strong)',
                              fontWeight: isToday ? 700 : 400,
                            }}>
                              {day.getDate()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                            {events.slice(0, 4).map(event => (
                              <button
                                key={event.id}
                                onClick={() => openEditModal(event)}
                                style={{
                                  font: 'var(--type-caption)',
                                  fontSize: '11px',
                                  padding: '2px 4px',
                                  background: 'var(--surface-card)',
                                  borderRadius: 'var(--radius-xs)',
                                  border: '1px solid var(--line-soft)',
                                  color: 'var(--text-body)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%',
                                }}
                                title={`${event.allDay ? '' : toOsloTime(event.start) + ' '}${event.title}`}
                              >
                                {event.allDay ? '' : <span style={{ color: 'var(--accent)', marginRight: '2px' }}>{toOsloTime(event.start)}</span>}
                                {event.title}
                              </button>
                            ))}
                            {events.length > 4 && (
                              <div style={{ font: 'var(--type-caption)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                +{events.length - 4} mer
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Mobile: vertical list of days
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = new Date(monday);
                    day.setDate(monday.getDate() + i);
                    const dayStr = day.toISOString().slice(0, 10);
                    const isToday = dayStr === todayStr;
                    const events = getEventsForDay(day);
                    return (
                      <div key={dayStr}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          marginBottom: 'var(--space-2)',
                        }}>
                          <span style={{
                            font: 'var(--type-numeral)',
                            fontSize: '14px',
                            color: isToday ? 'var(--accent)' : 'var(--text-strong)',
                            fontWeight: isToday ? 700 : 400,
                            minWidth: '24px',
                          }}>
                            {day.getDate()}
                          </span>
                          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', fontSize: '11px' }}>
                            {MONTHS[day.getMonth()]} · {weekDays[i]}
                          </span>
                          {isToday && (
                            <span style={{ font: 'var(--type-caption)', fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>
                              I dag
                            </span>
                          )}
                        </div>
                        {events.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', paddingLeft: '32px' }}>
                            {events.map(event => (
                              <button
                                key={event.id}
                                onClick={() => openEditModal(event)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                  font: 'var(--type-body)',
                                  fontSize: '13px',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  color: 'var(--text-body)',
                                }}
                              >
                                <span style={{ font: 'var(--type-numeral)', color: 'var(--accent)', minWidth: '40px' }}>
                                  {event.allDay ? '' : toOsloTime(event.start)}
                                </span>
                                <span>{event.title}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-faint)', font: 'var(--type-caption)', paddingLeft: '32px' }}>—</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
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
              {groceryList
                .filter(item => !item.checked)
                .map(item => (
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
                      <span style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-xs)', border: '2px solid var(--line-soft)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      </span>
                      <span style={{ font: 'var(--type-body)', color: 'var(--text-body)' }}>
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

          {/* Done items section */}
          {(() => {
            const doneItems = groceryList.filter(i => i.checked);
            if (doneItems.length === 0) return null;
            return (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <button
                  onClick={() => setShowDoneItems(!showDoneItems)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    font: 'var(--type-caption)',
                    marginBottom: showDoneItems ? 'var(--space-2)' : 0,
                  }}
                >
                  <Icon name={showDoneItems ? 'chevron-right' : 'chevron-right'} size={14} style={{ transform: showDoneItems ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                  {doneItems.length} ferdig {doneItems.length === 1 ? 'vare' : 'varer'}
                </button>
                {showDoneItems && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', opacity: 0.5 }}>
                    {doneItems.map(item => (
                      <div key={item.id} style={{ position: 'relative' }}>
                        <button
                          onClick={() => toggleListItem(item.id, item.checked)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-1) var(--space-2)',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          <span style={{ width: '16px', height: '16px', borderRadius: 'var(--radius-xs)', background: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name="check" size={10} style={{ color: 'white' }} />
                          </span>
                          <span style={{ font: 'var(--type-body)', textDecoration: 'line-through', color: 'var(--text-faint)' }}>
                            {item.content}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {groceryList.filter(i => !i.checked).length > 0 && (
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

      {/* Add Event Modal */}
      {showAddEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 'var(--space-4)',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowAddEvent(false); }}
        >
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ font: 'var(--type-title)', color: 'var(--text-strong)', marginBottom: 'var(--space-5)' }}>
              Ny hendelse
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                placeholder="Hva skjer?"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCalendarEvent()}
                autoFocus
              />

              <div>
                <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Dato
                </label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line-soft)',
                    background: 'var(--surface-sunk)',
                    color: 'var(--text-body)',
                    font: 'var(--type-body)',
                    fontFamily: 'var(--font-ui)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                    Fra
                  </label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--line-soft)',
                      background: 'var(--surface-sunk)',
                      color: 'var(--text-body)',
                      font: 'var(--type-body)',
                      fontFamily: 'var(--font-ui)',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                    Til (valgfritt)
                  </label>
                  <input
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--line-soft)',
                      background: 'var(--surface-sunk)',
                      color: 'var(--text-body)',
                      font: 'var(--type-body)',
                      fontFamily: 'var(--font-ui)',
                    }}
                  />
                </div>
              </div>

              {addEventError && (
                <p style={{ color: 'var(--destructive)', font: 'var(--type-caption)' }}>{addEventError}</p>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <Button tone="ghost" onClick={() => setShowAddEvent(false)}>Avbryt</Button>
                <Button onClick={addCalendarEvent} disabled={addEventLoading}>
                  {addEventLoading ? 'Lagrer...' : 'Legg til'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 'var(--space-4)',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setEditingEvent(null); }}
        >
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <h2 style={{ font: 'var(--type-title)', color: 'var(--text-strong)' }}>
                {confirmDelete ? 'Slett hendelse?' : 'Rediger hendelse'}
              </h2>
              <button onClick={() => setEditingEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 'var(--space-1)' }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            {confirmDelete ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>
                  Er du sikker på at du vil slette "{editingEvent.title}"?
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                  <Button tone="ghost" onClick={() => setConfirmDelete(false)}>Avbryt</Button>
                  <Button
                    onClick={deleteEvent}
                    disabled={editEventLoading}
                    style={{ background: 'var(--destructive)', color: 'white', border: 'none' }}
                  >
                    {editEventLoading ? 'Sletter...' : 'Slett'}
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  placeholder="Hva skjer?"
                  value={editEventTitle}
                  onChange={(e) => setEditEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditedEvent()}
                  autoFocus
                />

                <div>
                  <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                    Dato
                  </label>
                  <input
                    type="date"
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--line-soft)',
                      background: 'var(--surface-sunk)',
                      color: 'var(--text-body)',
                      font: 'var(--type-body)',
                      fontFamily: 'var(--font-ui)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                      Fra
                    </label>
                    <input
                      type="time"
                      value={editEventTime}
                      onChange={(e) => setEditEventTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--line-soft)',
                        background: 'var(--surface-sunk)',
                        color: 'var(--text-body)',
                        font: 'var(--type-body)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                      Til
                    </label>
                    <input
                      type="time"
                      value={editEventEndTime}
                      onChange={(e) => setEditEventEndTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--line-soft)',
                        background: 'var(--surface-sunk)',
                        color: 'var(--text-body)',
                        font: 'var(--type-body)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    />
                  </div>
                </div>

                {editEventError && (
                  <p style={{ color: 'var(--destructive)', font: 'var(--type-caption)' }}>{editEventError}</p>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                  <Button
                    tone="ghost"
                    onClick={() => setConfirmDelete(true)}
                    style={{ color: 'var(--destructive)' }}
                  >
                    <Icon name="trash" size={14} />
                    {' '}Slett
                  </Button>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button tone="ghost" onClick={() => setEditingEvent(null)}>Avbryt</Button>
                    <Button onClick={saveEditedEvent} disabled={editEventLoading}>
                      {editEventLoading ? 'Lagrer...' : 'Lagre'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
