import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Search, X, MapPin } from 'lucide-react';

interface School {
    school_id: string;
    school_name: string;
    school_level: string;
    office_of_education_name: string;
    road_address: string;
}

interface SchoolSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (schoolId: string, schoolName: string) => void;
}

export const SchoolSearchModal: React.FC<SchoolSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<School[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
            return;
        }

        const fetchSchools = async () => {
            if (!searchTerm.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('schools')
                    .select('*')
                    .ilike('school_name', `%${searchTerm}%`)
                    .limit(50);

                if (error) throw error;
                setResults(data || []);
            } catch (err) {
                console.error("Error fetching schools:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchSchools();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-up">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-900">학교 검색</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="학교 이름을 입력하세요 (예: 한민고)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            검색 중...
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="space-y-1">
                            {results.map((school) => (
                                <li
                                    key={school.school_id}
                                    onClick={() => onSelect(school.school_id, school.school_name)}
                                    className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 border border-transparent hover:border-gray-100"
                                >
                                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        {school.school_name}
                                        {school.school_level && (
                                            <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {school.school_level}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium truncate">
                                        <MapPin size={12} className="flex-shrink-0" />
                                        <span className="truncate">{school.road_address || school.office_of_education_name}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : searchTerm.trim() ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            학교 이름을 입력해주세요.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
