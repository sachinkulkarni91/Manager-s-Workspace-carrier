import { useState, useEffect } from "react";
import {
    Bold,
    Italic,
    Underline,
    RotateCcw,
    RotateCw,
    ChevronDown,
    MoreHorizontal,
    Link as LinkIcon,
    Asterisk,
    Flag,
    FilePlus,
    List,
} from "lucide-react";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, FORMAT_TEXT_COMMAND } from 'lexical';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';

import './editor.css';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

const editorConfig = {
    namespace: 'email-editor',
    theme: {
        text: {
            bold: 'text-bold',
            italic: 'text-italic',
            underline: 'text-underline',
            fontFamily: 'font-family',
            fontSize: 'font-size',
        },
    },
    nodes: [],
    onError: (error: Error) => {
        console.error(error);
    },
};

function Editor() {
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-wrapper">
                <ToolbarPlugin />
                <div className="editor-container">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="outline-none" />}
                        placeholder={<div className="editor-placeholder">Compose your email</div>}
                        ErrorBoundary={ErrorBoundary}
                    />
                    <HistoryPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}

export function EmailDraft() {
    const [toRecipients, setToRecipients] = useState<string[]>(["Luis Valdez"]);
    const [toInput, setToInput] = useState("");
    const [subject, setSubject] = useState(
        "INC1182405 - problema de conectividad entre nuestro sistema y la banca"
    );
    const [selectedOption, setSelectedOption] = useState<'quick-msg' | 'list'>('quick-msg');

    function removeRecipient(name: string) {
        setToRecipients((prev) => prev.filter((r) => r !== name));
    }

    function addRecipientFromInput() {
        const trimmed = toInput.trim();
        if (!trimmed) return;
        setToRecipients((prev) => [...prev, trimmed]);
        setToInput("");
    }

    return (
        <div className="w-full h-full bg-white">
            {/* Top header line with subject and top-right attach/send */}
            <div className="border-b" style={{ padding: '12px 24px' }}>
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg font-base text-gray-700">
                        {subject}
                    </h1>

                    <div className="flex items-center" style={{ gap: '12px', letterSpacing: '.1px' }}>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-6 border text-sm bg-white hover:bg-gray-50"
                            style={{ cursor: 'pointer', backgroundColor: '#EEE', padding: '4px 16px' }}
                        >
                            {/* <Paperclip className="w-4 h-4 text-gray-600" /> */}
                            <span className="text-sm text-gray-700">Attach file</span>
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-6 border text-sm text-white hover:bg-gray-50"
                            style={{ cursor: 'pointer', backgroundColor: '#3C59E7', padding: '4px 16px' }}
                        >
                            <span className="text-sm text-gray-700">Send email</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main body: left editor + right quick messages */}
            <div className="pb-6 pt-5 flex" style={{ paddingLeft: '24px', height: '100%' }}>
                {/* Left: email form/editor */}
                <div className="bg-white" style={{ width: '75%', borderRight: '1px solid #BBB', padding: '20px 24px 0 0' }}>
                    <div className="space-y-4">
                        {/* Reply to (read-only like tag) */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label className="block text-sm text-gray-600 mb-1" style={{ width: 'max-content', minWidth: '60px' }}>Reply to</label>
                            <div className="flex items-center gap-2 bg-red-500" style={{ width: '100%' }}>
                                <div className="flex items-center w-full border px-3 py-2 bg-gray-50">
                                    <div className="flex-1 min-w-0 text-sm text-gray-800 truncate">
                                        IT Service Desk &lt;infosyscardev@service-now.com&gt;
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                </div>
                            </div>
                        </div>

                        {/* To field with chip + Cc Bcc */}
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-full" style={{ display: 'flex', alignItems: 'center' }}>
                                    <label
                                        className="block text-sm text-gray-600 mb-1"
                                        style={{
                                            width: 'max-content',
                                            minWidth: '60px',
                                            paddingRight: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'right'
                                        }}
                                    >
                                        <span><Asterisk className="w-4" /></span>
                                        <span>To</span>
                                    </label>
                                    <div className="min-h-[44px] w-full border rounded px-3 py-2 flex items-center gap-2 flex-wrap">
                                        {/* Chips */}
                                        {toRecipients.map((r) => (
                                            <div
                                                key={r}
                                                className="inline-flex items-center gap-2 border text-sm px-2 py-1"
                                                style={{
                                                    borderRadius: '9999px',
                                                    borderColor: '#AAA'
                                                }}
                                            >
                                                <span className="text-gray-800">{r}</span>
                                                <button
                                                    onClick={() => removeRecipient(r)}
                                                    className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-gray-200"
                                                    aria-label={`Remove ${r}`}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}

                                        {/* Input for more recipients */}
                                        <input
                                            value={toInput}
                                            onChange={(e) => setToInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addRecipientFromInput();
                                                }
                                            }}
                                            placeholder="Enter recipient email"
                                            className="flex-1 min-w-[180px] text-sm outline-none"
                                        />

                                        <div className="ml-3 mt-6 flex items-center gap-2 text-sm" style={{ color: '#3C59E7' }}>
                                            <button className="text-sm text-[#2b8b8b]">Cc</button>
                                            <button className="text-sm text-[#2b8b8b]">Bcc</button>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Subject */}
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <label className="block text-sm text-gray-600 mb-1" style={{ width: 'max-content', minWidth: '60px' }}>Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border-b px-3 py-2 text-sm"
                                style={{ borderColor: '#AAA' }}
                                placeholder="Enter email subject"
                            />
                            <div className="flex items-center text-sm" style={{
                                position: 'absolute',
                                right: '14px',
                                color: '#3C59E7'
                            }}>
                                <button className="text-sm text-[#2b8b8b]"><Flag className="w-3" /></button>
                            </div>
                        </div>

                        <div style={{ border: '2px solid #AAA'}}>
                            <Editor />
                        </div>
                    </div>
                </div>

                {/* Quick Messages (right column) */}
                <aside style={{
                    width: '25%',
                    display: 'flex',
                    backgroundColor: 'red'
                }}>
                    <div
                        style={{
                            width: '85%',
                            backgroundColor: '#ebf0f4ff',
                            borderRight: '1px solid #BBB',
                            padding: '24px 20px'
                        }}>
                        <p style={{ fontSize: '20px', color: '#444', marginBottom: '20px' }}>Quick Messages</p>
                        <div className="relative" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #AAA' }}>
                            <div className="absolute left-3 top-2.5 pointer-events-none" style={{ paddingLeft: '10px'}}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <input
                                className="w-full pl-10 pr-3 py-2 border text-sm bg-white placeholder-gray-400"
                                placeholder="Search messages"
                                aria-label="Search quick messages"
                                style={{ paddingLeft: '30px'}}
                            />
                        </div>

                        <div style={{ height: 'max-content', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <p style={{ fontWeight: 600}}>No quick messages yet</p>
                        </div>

                    </div>

                    <div style={{ width: '15%', backgroundColor: '#dadfe9ff' }}>
                        <div
                            style={{ padding: '10px', cursor: 'pointer', borderLeft: selectedOption === 'quick-msg' ? '2px solid #3C59E7' : '' }}
                            onClick={() => setSelectedOption('quick-msg')}
                        >
                            <button
                                type="button"
                                aria-label="New quick message"
                                title="New"
                                style={{
                                    borderRadius: '999px',
                                    width: '34px',
                                    height: '34px',
                                    backgroundColor: selectedOption === 'quick-msg' ? 'white' : '',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}
                            >
                                <FilePlus className="w-4" style={{ color: selectedOption === 'quick-msg' ? '#3C59E7' : 'black' }} />
                            </button>
                        </div>
                        <div
                            style={{ padding: '10px', cursor: 'pointer', borderLeft: selectedOption === 'list' ? '2px solid #3C59E7' : '' }}
                            onClick={() => setSelectedOption('list')}

                        >
                            <button
                                type="button"
                                aria-label="New quick message"
                                title="New"
                                style={{
                                    borderRadius: '999px',
                                    width: '34px',
                                    height: '34px',
                                    backgroundColor: selectedOption === 'list' ? 'white' : '',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}
                            >
                                <List className="w-4" style={{ color: selectedOption === 'list' ? '#3C59E7' : 'black' }} />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
