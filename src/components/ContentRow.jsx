import { useRef, useEffect, useState } from 'react';

const ContentRow = ({ id, children }) => {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateArrows = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    const maxScroll = scrollWidth - clientWidth;
    
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < maxScroll - 5);
    setIsAtEnd(scrollLeft >= maxScroll - 10);

    const viewAllCard = rowRef.current.querySelector('.view-all-card');
    if (viewAllCard) {
      viewAllCard.classList.toggle('show', scrollLeft >= maxScroll - 10);
    }
  };

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    updateArrows();
    
    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateArrows);
    });
    observer.observe(row, { childList: true });
    
    window.addEventListener("resize", updateArrows);
    
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scroll = (direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: direction === 'left' ? -800 : 800,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="row-wrapper">
      <div className={`left-gradient ${canScrollLeft ? 'can-scroll' : ''}`}>
        <button className="scroll-left" onClick={() => scroll('left')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
      </div>

      <div 
        className={`content-row ${isAtEnd ? 'at-end' : ''}`} 
        id={id} 
        ref={rowRef} 
        onScroll={updateArrows}
      >
        {children}
      </div>

      <div className={`right-gradient ${canScrollRight ? 'can-scroll' : ''}`}>
        <button className="scroll-right" onClick={() => scroll('right')}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default ContentRow;
