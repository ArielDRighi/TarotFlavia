/**
 * UsersFilters Component
 *
 * Filtros de búsqueda y filtrado para la tabla de usuarios
 */

'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/utils/useDebounce';
import type { UserFilters } from '@/types/admin-users.types';

interface UsersFiltersProps {
  onFilterChange: (filters: Partial<UserFilters>) => void;
}

export function UsersFilters({ onFilterChange }: UsersFiltersProps) {
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<string>('');
  const [role, setRole] = useState<string>('');

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const filters: Partial<UserFilters> = {};

    if (debouncedSearch) filters.search = debouncedSearch;
    // Only add plan/role if not 'all'
    if (plan && plan !== 'all') filters.plan = plan as UserFilters['plan'];
    if (role && role !== 'all') filters.role = role as UserFilters['role'];

    onFilterChange(filters);
  }, [debouncedSearch, plan, role, onFilterChange]);

  const handleClearFilters = () => {
    setSearch('');
    setPlan('');
    setRole('');
    onFilterChange({});
  };

  const hasActiveFilters = search || plan || role;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Plan Filter */}
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los planes</SelectItem>
            <SelectItem value="anonymous">Anónimo</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        {/* Role Filter */}
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="consumer">Consumer</SelectItem>
            <SelectItem value="tarotist">Tarotist</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            size="icon"
            aria-label="Limpiar filtros"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpiar filtros</span>
          </Button>
        )}
      </div>
    </div>
  );
}
