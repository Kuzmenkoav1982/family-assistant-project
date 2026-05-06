import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductEditorProps } from './ProductEditor/types';
import BasicTab from './ProductEditor/BasicTab';
import TagsTab from './ProductEditor/TagsTab';
import MediaTab from './ProductEditor/MediaTab';
import AboutTab from './ProductEditor/AboutTab';
import CompositionTab from './ProductEditor/CompositionTab';

const ProductEditor = ({ product, onChange, onSave, onCancel, loading }: ProductEditorProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="tags">Теги подбора</TabsTrigger>
          <TabsTrigger value="media">Изображения</TabsTrigger>
          <TabsTrigger value="about">О продукте</TabsTrigger>
          <TabsTrigger value="composition">Состав</TabsTrigger>
        </TabsList>

        <BasicTab product={product} onChange={onChange} />
        <TagsTab product={product} onChange={onChange} />
        <MediaTab product={product} onChange={onChange} />
        <AboutTab product={product} onChange={onChange} />
        <CompositionTab product={product} onChange={onChange} />
      </Tabs>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={onSave} disabled={loading} className="flex-1">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default ProductEditor;
