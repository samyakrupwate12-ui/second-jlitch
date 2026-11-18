'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductShareProps {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'category'>;
  variant?: 'icon' | 'button' | 'outline';
  className?: string;
}

export default function ProductShare({ product, variant = 'button', className = '' }: ProductShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const detailPath = `/products/${product.slug || product.id}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}${detailPath}`);
    } else {
      setShareUrl(`https://secondjlitch.in${detailPath}`);
    }
  }, [detailPath]);

  const shareTitle = `${product.name} | SECOND JLITCH`;
  const shareText = `Check out "${product.name}"${product.price ? ` (₹${product.price.toLocaleString('en-IN')})` : ''} on SECOND JLITCH — pre-loved & curated fashion:`;

  const copyToClipboard = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = shareUrl || `https://secondjlitch.in${detailPath}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = shareUrl || `https://secondjlitch.in${detailPath}`;

    // If mobile native Web Share API is supported, prefer native sheet
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User closed the native share picker
          return;
        }
        // Fall back to modal
      }
    }

    setIsOpen(true);
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl || `https://secondjlitch.in${detailPath}`}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl || `https://secondjlitch.in${detailPath}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl || `https://secondjlitch.in${detailPath}`}`)}`;

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleShareClick}
          aria-label={`Share ${product.name}`}
          title="Share piece"
          className={`p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:text-sky-600 hover:bg-white shadow-sm transition-all transform active:scale-90 cursor-pointer ${className}`}
        >
          <Share2 className="w-4 h-4 stroke-[1.75]" />
        </button>
      ) : variant === 'outline' ? (
        <button
          type="button"
          onClick={handleShareClick}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${className}`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Piece</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleShareClick}
          aria-label={`Share ${product.name}`}
          className={`p-4 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-600 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs ${className}`}
          title="Share piece"
        >
          <Share2 className="w-5 h-5" />
          <span className="sr-only sm:not-sr-only text-xs font-semibold uppercase tracking-wider">
            Share
          </span>
        </button>
      )}

      {/* Share Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-sky-100 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 id="share-modal-title" className="text-base font-serif font-semibold text-slate-900">
                  Share this piece
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {product.name} {product.price ? `• ₹${product.price.toLocaleString('en-IN')}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copy Link Section */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Product Link
              </label>
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-sky-500 transition-colors">
                <input
                  type="text"
                  readOnly
                  value={shareUrl || `https://secondjlitch.in${detailPath}`}
                  className="flex-1 bg-transparent px-3 text-xs text-slate-700 font-mono select-all outline-hidden"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-sky-600 text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  Link copied to clipboard!
                </p>
              )}
            </div>

            {/* Quick Share Channels */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Share via
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px] font-semibold">WhatsApp</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 transition-all hover:-translate-y-0.5"
                >
                  <ExternalLink className="w-5 h-5 text-sky-600" />
                  <span className="text-[11px] font-semibold">X (Twitter)</span>
                </a>

                {/* Email */}
                <a
                  href={emailUrl}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-100 transition-all hover:-translate-y-0.5"
                >
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span className="text-[11px] font-semibold">Email</span>
                </a>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-serif italic">
                &quot;Good pieces deserve another story.&quot;
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
