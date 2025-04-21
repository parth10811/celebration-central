import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  text?: string;
  className?: string;
}

const BackButton = ({ to, text = 'Back', className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleClick}
      className={`mb-6 hover:bg-background group ${className}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      {text}
    </Button>
  );
};

export default BackButton; 