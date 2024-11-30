"use client";

import qs from "query-string";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    ChangeEvent,
    useEffect,
    useState,
} from "react";
import { Input } from "@/components/ui/input";

export const SearchInput = ({ orgId }: { orgId: string }) => {
    const router = useRouter();
    const [value, setValue] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: "/code-editor",
            query: {
                search: value,
                orgId: orgId || null,
            },
        }, { skipEmptyString: true, skipNull: true });

        router.push(url);
    }, [value, orgId, router]);

    return (
        <div className="w-full relative">
            <Search
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
            />
            <Input
                className="w-full max-w-[516px] pl-9"
                placeholder="Search code editors"
                onChange={handleChange}
                value={value}
            />
        </div>
    );
};
