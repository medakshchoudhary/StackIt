import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { uploadAPI } from '../services/uploadAPI';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Smile,
  Upload,
  Loader
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!editor) return null;

  const addLink = (e) => {
    e.preventDefault();
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const removeLink = (e) => {
    e.preventDefault();
    editor.chain().focus().unsetLink().run();
    setShowLinkDialog(false);
  };

  const addImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      try {
        // Upload to backend
        const uploadResponse = await uploadAPI.uploadImage(file);
        
        if (uploadResponse.success) {
          // Use the uploaded image URL
          const imageUrl = uploadResponse.data.url.startsWith('http') 
            ? uploadResponse.data.url 
            : `${window.location.origin}${uploadResponse.data.url}`;
            
          editor.chain().focus().setImage({ 
            src: imageUrl,
            alt: uploadResponse.data.originalName || file.name,
            title: uploadResponse.data.originalName || file.name
          }).run();
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Fallback to local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          editor.chain().focus().setImage({ 
            src: e.target.result,
            alt: file.name,
            title: file.name
          }).run();
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    }
    event.target.value = '';
  };

  const addEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪', '🙏', '✍️', '💅', '🤳', '❤️', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '⭐', '🌟', '✨', '�', '⚡', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '�️', '�️', '❄️', '☃️', '⛄', '�️', '�', '�', '�', '☔', '🌊', '�', '�', '�'];

  return (
    <div className="border-b border-gray-200 p-2 space-y-2">
      {/* First Row - Text Formatting */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('underline') ? 'bg-gray-200' : ''
          }`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('strike') ? 'bg-gray-200' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('code') ? 'bg-gray-200' : ''
          }`}
          title="Code"
        >
          <Code size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>

      {/* Second Row - Alignment, Links, Images */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
          }`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowLinkDialog(!showLinkDialog); }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Upload Image"
          disabled={uploading}
        >
          {uploading ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={addImage}
          className="hidden"
        />

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }}
          className="p-2 rounded hover:bg-gray-100"
          title="Emoji"
        >
          <Smile size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          className="p-2 rounded hover:bg-gray-100"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          className="p-2 rounded hover:bg-gray-100"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="bg-gray-50 p-3 rounded border">
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL (e.g., https://example.com)"
              className="flex-1 px-2 py-1 border rounded text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLink(e);
                }
              }}
            />
            <button
              type="button"
              onClick={addLink}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={removeLink}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowLinkDialog(false); }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="bg-gray-50 p-3 rounded border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Choose an emoji:</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowEmojiPicker(false); }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => { e.preventDefault(); addEmoji(emoji); }}
                className="p-1 hover:bg-gray-100 rounded text-lg hover:scale-125 transition-transform"
                title={`Add ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = "Start typing..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Strike,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md my-4',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-medium',
        },
        suggestion: {
          items: () => {
            // This will be handled by the MentionList component
            return [];
          },
          render: () => {
            let component;
            let popup;

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }

                return component.ref?.onKeyDown(props);
              },

              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[200px] p-4 text-gray-900',
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent
          editor={editor}
          className="min-h-[200px] max-h-[400px] overflow-y-auto"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
