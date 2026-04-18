import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { RecipeCategory, CuisineType, DifficultyLevel } from '@/types/recipe.types';

const CATEGORIES = [
  { value: 'breakfast', label: 'Завтрак', icon: '🥐' },
  { value: 'soup', label: 'Супы', icon: '🍜' },
  { value: 'main', label: 'Основное', icon: '🍖' },
  { value: 'side', label: 'Гарниры', icon: '🥔' },
  { value: 'salad', label: 'Салаты', icon: '🥗' },
  { value: 'dessert', label: 'Десерты', icon: '🍰' },
  { value: 'snack', label: 'Закуски', icon: '🧀' },
  { value: 'drink', label: 'Напитки', icon: '☕' },
  { value: 'other', label: 'Другое', icon: '🍴' }
];

const CUISINES = [
  { value: 'russian', label: 'Русская' },
  { value: 'italian', label: 'Итальянская' },
  { value: 'asian', label: 'Азиатская' },
  { value: 'american', label: 'Американская' },
  { value: 'french', label: 'Французская' },
  { value: 'mexican', label: 'Мексиканская' },
  { value: 'mediterranean', label: 'Средиземноморская' },
  { value: 'other', label: 'Другая' }
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Легко' },
  { value: 'medium', label: 'Средне' },
  { value: 'hard', label: 'Сложно' }
];

const DIETARY_TAGS = [
  'вегетарианское',
  'веганское',
  'без глютена',
  'без лактозы',
  'детское',
  'диетическое',
  'постное'
];

interface NewRecipe {
  name: string;
  description: string;
  category: RecipeCategory;
  cuisine: CuisineType;
  cooking_time: string;
  difficulty: DifficultyLevel;
  servings: string;
  ingredients: string;
  instructions: string;
  dietary_tags: string[];
  image_url: string;
  images: string[];
}

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRecipe: NewRecipe;
  onRecipeChange: (recipe: NewRecipe) => void;
  onSave: () => void;
  isSaving: boolean;
  addMethod: 'text' | 'photo' | 'ocr';
  onMethodChange: (method: 'text' | 'photo' | 'ocr') => void;
  uploadedImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onOCR: () => void;
  isOCRProcessing: boolean;
}

export function AddRecipeDialog({
  open,
  onOpenChange,
  newRecipe,
  onRecipeChange,
  onSave,
  isSaving,
  addMethod,
  onMethodChange,
  uploadedImages,
  onImageUpload,
  onRemoveImage,
  onOCR,
  isOCRProcessing
}: AddRecipeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle>Добавить рецепт</DialogTitle>
        </DialogHeader>

        <Tabs value={addMethod} onValueChange={(v) => onMethodChange(v as 'text' | 'photo' | 'ocr')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <Icon name="FileText" size={16} className="mr-2" />
              Текст
            </TabsTrigger>
            <TabsTrigger value="photo">
              <ImageIcon size={16} className="mr-2" />
              Фото
            </TabsTrigger>
            <TabsTrigger value="ocr">
              <Icon name="ScanText" size={16} className="mr-2" />
              Распознать
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={newRecipe.name}
                onChange={(e) => onRecipeChange({ ...newRecipe, name: e.target.value })}
                placeholder="Борщ"
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Input
                value={newRecipe.description}
                onChange={(e) => onRecipeChange({ ...newRecipe, description: e.target.value })}
                placeholder="Традиционный украинский суп"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label>Категория</Label>
                <Select value={newRecipe.category} onValueChange={(v) => onRecipeChange({ ...newRecipe, category: v as RecipeCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Кухня</Label>
                <Select value={newRecipe.cuisine} onValueChange={(v) => onRecipeChange({ ...newRecipe, cuisine: v as CuisineType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINES.map(cuisine => (
                      <SelectItem key={cuisine.value} value={cuisine.value}>
                        {cuisine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <Label>Время (мин)</Label>
                <Input
                  type="number"
                  value={newRecipe.cooking_time}
                  onChange={(e) => onRecipeChange({ ...newRecipe, cooking_time: e.target.value })}
                  placeholder="60"
                />
              </div>
              <div>
                <Label>Сложность</Label>
                <Select value={newRecipe.difficulty} onValueChange={(v) => onRecipeChange({ ...newRecipe, difficulty: v as DifficultyLevel })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(diff => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Порций</Label>
                <Input
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => onRecipeChange({ ...newRecipe, servings: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Ингредиенты *</Label>
              <Textarea
                value={newRecipe.ingredients}
                onChange={(e) => onRecipeChange({ ...newRecipe, ingredients: e.target.value })}
                placeholder="Свекла - 2 шт&#10;Капуста - 300г&#10;Мясо - 500г"
                rows={5}
              />
            </div>
            <div>
              <Label>Инструкции *</Label>
              <Textarea
                value={newRecipe.instructions}
                onChange={(e) => onRecipeChange({ ...newRecipe, instructions: e.target.value })}
                placeholder="1. Сварить мясо&#10;2. Добавить овощи&#10;3. Варить 1 час"
                rows={5}
              />
            </div>
            <div>
              <Label>Диетические метки</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {DIETARY_TAGS.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={newRecipe.dietary_tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onRecipeChange({ ...newRecipe, dietary_tags: [...newRecipe.dietary_tags, tag] });
                        } else {
                          onRecipeChange({ ...newRecipe, dietary_tags: newRecipe.dietary_tags.filter(t => t !== tag) });
                        }
                      }}
                    />
                    <Label htmlFor={tag} className="cursor-pointer">{tag}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Фото блюда (до 5 штук)</Label>
              <Input type="file" accept="image/*" multiple onChange={onImageUpload} disabled={uploadedImages.length >= 5} />
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={`data:image/jpeg;base64,${img}`} 
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">{uploadedImages.length} / 5 фото</p>
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4 mt-4">
            <div>
              <Label>Загрузить фото (до 5 штук)</Label>
              <Input type="file" accept="image/*" multiple onChange={onImageUpload} disabled={uploadedImages.length >= 5} />
              {uploadedImages.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={`data:image/jpeg;base64,${img}`} 
                          alt={`Фото ${idx + 1}`}
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    AI распознает блюдо и предложит название, категорию и описание
                  </p>
                  <p className="text-xs text-gray-500">{uploadedImages.length} / 5 фото загружено</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-4 mt-4">
            <div>
              <Label>Сфотографируйте рецепт</Label>
              <Input type="file" accept="image/*" onChange={onImageUpload} disabled={uploadedImages.length >= 1} />
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <img 
                    src={`data:image/jpeg;base64,${uploadedImages[0]}`} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button 
                    onClick={onOCR} 
                    disabled={isOCRProcessing}
                    className="w-full mt-4"
                  >
                    {isOCRProcessing ? 'Распознаю...' : 'Распознать текст'}
                  </Button>
                </div>
              )}
            </div>
            {newRecipe.name && (
              <div className="space-y-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={newRecipe.name}
                    onChange={(e) => onRecipeChange({ ...newRecipe, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ингредиенты</Label>
                  <Textarea
                    value={newRecipe.ingredients}
                    onChange={(e) => onRecipeChange({ ...newRecipe, ingredients: e.target.value })}
                    rows={5}
                  />
                </div>
                <div>
                  <Label>Инструкции</Label>
                  <Textarea
                    value={newRecipe.instructions}
                    onChange={(e) => onRecipeChange({ ...newRecipe, instructions: e.target.value })}
                    rows={5}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}