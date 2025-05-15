import { useEffect, useState } from 'react';
import { supabase } from '../SuperbaseConfig/supabaseClient';

type City = {
  id: number;
  name: string;
};

function App() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    async function fetchCities() {
      const { data, error } = await supabase.from('cities').select('*');
      if (error) {
        console.error('Erro ao buscar cidades:', error);
      } else {
        setCities(data || []);
      }
    }
    fetchCities();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cidades</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nome</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id}>
              <td className="border px-4 py-2">{city.id}</td>
              <td className="border px-4 py-2">{city.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
