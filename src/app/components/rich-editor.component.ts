import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  ChangeDetectionStrategy,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface ToolbarButton {
  label: string;
  action: () => void;
  isActive: () => boolean;
  icon?: string;
}

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editor-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <button
          *ngFor="let btn of toolbarButtons()"
          type="button"
          [class.active]="btn.isActive()"
          class="toolbar-btn"
          (click)="btn.action()"
          [title]="btn.label">
          @if (btn.icon) {
            <i [class]="btn.icon" aria-hidden="true"></i>
            <span class="sr-only">{{ btn.label }}</span>
          } @else {
            {{ btn.label }}
          }
        </button>
      </div>

      <!-- Editor -->
      <div
        #editorElement
        class="editor-content"
        [class.disabled]="disabled()">
      </div>

      <!-- Footer -->
      <div class="editor-footer">
        <span class="char-count">{{ charCount() }} characters</span>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: #18181b;
      overflow: hidden;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: #0c0c0f;
    }

    .toolbar-btn {
      padding: 6px 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #18181b;
      color: #d4d4d8;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .toolbar-btn:hover {
      background: #27272a;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .toolbar-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .toolbar-btn i {
      font-size: 16px;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .editor-content {
      min-height: 300px;
      max-height: 600px;
      overflow-y: auto;
      padding: 16px;
      color: #e4e4e7;
    }

    .editor-content.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .editor-footer {
      padding: 8px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: #0c0c0f;
      text-align: right;
    }

    .char-count {
      font-size: 12px;
      color: #71717a;
    }

    /* TipTap Styles */
    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 280px;
    }

    :host ::ng-deep .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: #71717a;
      float: left;
      height: 0;
      pointer-events: none;
    }

    :host ::ng-deep .ProseMirror pre {
      background: #0c0c0f;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 16px;
      margin: 12px 0;
      overflow-x: auto;
      position: relative;
    }

    :host ::ng-deep .ProseMirror pre code {
      background: none;
      color: #e4e4e7;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      display: block;
    }

    :host ::ng-deep .ProseMirror code {
      background: #27272a;
      color: #fbbf24;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
    }

    :host ::ng-deep .ProseMirror h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 24px 0 12px;
      color: #f4f4f5;
    }

    :host ::ng-deep .ProseMirror h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 20px 0 10px;
      color: #e4e4e7;
    }

    :host ::ng-deep .ProseMirror a {
      color: #38bdf8;
      text-decoration: underline;
      cursor: pointer;
    }

    :host ::ng-deep .ProseMirror p {
      margin: 8px 0;
      line-height: 1.6;
    }

    :host ::ng-deep .ProseMirror img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 12px 0;
    }

    :host ::ng-deep .ProseMirror ul,
    :host ::ng-deep .ProseMirror ol {
      padding-left: 24px;
      margin: 8px 0;
    }

    :host ::ng-deep .ProseMirror li {
      margin: 4px 0;
    }
  `],
})
export class RichEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorElement', { static: true }) editorElement!: ElementRef<HTMLElement>;

  // Inputs
  readonly placeholder = input<string>('Start writing...');
  readonly disabled = input<boolean>(false);
  readonly initialContent = input<string>('');

  // Outputs
  readonly contentChange = output<string>();

  // Signals
  private readonly content = signal<string>('');
  private readonly selectionUpdate = signal<number>(0);
  
  readonly charCount = computed(() => {
    const text = this.content().replace(/<[^>]*>/g, '');
    return text.length;
  });

  private editor?: Editor;

  readonly toolbarButtons = computed<ToolbarButton[]>(() => {
    // Trigger reactivity
    this.selectionUpdate();

    return [
      {
        label: 'Bold',
        action: () => this.toggleFormat('bold'),
        isActive: () => this.isActive('bold'),
      },
      {
        label: 'Italic',
        action: () => this.toggleFormat('italic'),
        isActive: () => this.isActive('italic'),
      },
      {
        label: 'H1',
        action: () => this.toggleHeading(1),
        isActive: () => this.isActive('heading', { level: 1 }),
      },
      {
        label: 'H2',
        action: () => this.toggleHeading(2),
        isActive: () => this.isActive('heading', { level: 2 }),
      },
      {
        label: 'Code',
        icon: 'pi pi-code',
        action: () => this.toggleFormat('codeBlock'),
        isActive: () => this.isActive('codeBlock'),
      },
      {
        label: 'Link',
        icon: 'pi pi-paperclip',
        action: () => this.insertLink(),
        isActive: () => this.isActive('link'),
      },
      {
        label: 'Image',
        icon: 'pi pi-images',
        action: () => this.insertImage(),
        isActive: () => false,
      },
      {
        label: 'Bullet List',
        icon: 'pi pi-list',
        action: () => this.toggleFormat('bulletList'),
        isActive: () => this.isActive('bulletList'),
      },
      {
        label: 'Ordered List',
        icon: 'pi pi-sort-numeric-down',
        action: () => this.toggleFormat('orderedList'),
        isActive: () => this.isActive('orderedList'),
      },
    ];
  });

  ngOnInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  private initializeEditor(): void {
    this.editor = new Editor({
      element: this.editorElement.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
        }),
        Heading.configure({
          levels: [1, 2],
        }),
        CodeBlockLowlight.configure({
          lowlight,
        }),
        Image.configure({
          inline: false,
          HTMLAttributes: {
            class: 'editor-image',
          },
        }),
      ],
      content: this.initialContent(),
      editorProps: {
        attributes: {
          class: 'prose prose-invert',
          'data-placeholder': this.placeholder(),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.content.set(html);
        this.contentChange.emit(html);
      },
      onSelectionUpdate: () => {
        this.selectionUpdate.update(v => v + 1);
      },
    });
  }

  private toggleFormat(format: string): void {
    if (!this.editor) return;

    const chain = this.editor.chain().focus();
    
    switch (format) {
      case 'bold':
        chain.toggleBold().run();
        break;
      case 'italic':
        chain.toggleItalic().run();
        break;
      case 'codeBlock':
        chain.toggleCodeBlock().run();
        break;
      case 'bulletList':
        chain.toggleBulletList().run();
        break;
      case 'orderedList':
        chain.toggleOrderedList().run();
        break;
    }
  }

  private toggleHeading(level: 1 | 2): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  private insertLink(): void {
    const url = prompt('Enter URL:');
    if (!url) return;

    if (this.editor?.state.selection.empty) {
      const text = prompt('Enter link text:');
      if (!text) return;
      
      this.editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${text}</a>`)
        .run();
    } else {
      this.editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  private insertImage(): void {
    const url = prompt('Enter image URL:');
    if (!url) return;

    this.editor?.chain().focus().setImage({ src: url }).run();
  }

  private isActive(format: string, attrs?: Record<string, unknown>): boolean {
    if (!this.editor) return false;
    return this.editor.isActive(format, attrs);
  }

  // Public API
  public getContent(): string {
    return this.editor?.getHTML() || '';
  }

  public setContent(html: string): void {
    this.editor?.commands.setContent(html);
  }

  public clear(): void {
    this.editor?.commands.clearContent();
  }

  public focus(): void {
    this.editor?.commands.focus();
  }
}
